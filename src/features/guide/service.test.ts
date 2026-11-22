import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/infra/store/memory-store";
import { AppError } from "@/shared/error";
import type { StructuredGenerator } from "./agent/generate-guide";
import { createGuideRepository } from "./repository";
import { SAMPLE_DEFINITIONS, SAMPLE_GUIDE_ID } from "./sample";
import type { DraftGuide, DraftStep, StepInput } from "./schema";
import { toWorkerGuide } from "./schema";
import { createGuideService } from "./service";

const MANUAL = "1. 컵에 얼음을 가득 채운다. 문의는 010-1234-5678";

const iceStep: DraftStep = {
  action: "컵에 얼음을 채워요",
  detail: "",
  emoji: "🧊",
  caution: null,
  doneCheck: "얼음이 가득 찼어요",
  sourceQuote: "컵에 얼음을 가득 채운다",
};
const ungroundedStep: DraftStep = {
  ...iceStep,
  action: "시럽을 넣어요",
  sourceQuote: "시럽을 두 번 넣는다",
};

function setup(response: DraftGuide) {
  const store = createMemoryStore();
  const seenPrompts: string[] = [];
  const generate: StructuredGenerator = async ({ messages }) => {
    seenPrompts.push(messages.at(-1)?.content ?? "");
    return response;
  };
  const service = createGuideService({
    repository: createGuideRepository(() => store),
    generate,
    modelName: () => "test-model",
  });
  return { service, seenPrompts };
}

const toInput = (step: DraftStep & { id: string }): StepInput => ({
  id: step.id,
  action: step.action,
  detail: step.detail,
  emoji: step.emoji,
  caution: step.caution,
  doneCheck: step.doneCheck,
  sourceQuote: step.sourceQuote,
});

const errorCode = async (run: () => Promise<unknown>) => {
  try {
    await run();
  } catch (error) {
    if (error instanceof AppError) return error.errorCode.code;
    throw error;
  }
  return null;
};

describe("guideService", () => {
  it("생성한 가이드는 초안 상태, 점검 결과와 생성 기록 포함", async () => {
    const { service } = setup({ title: "음료 준비", steps: [iceStep], rejectReason: null });

    const guide = await service.createFromManual({ manual: MANUAL });

    expect(guide.status).toBe("draft");
    expect(guide.steps[0].issues).toEqual([]);
    expect(guide.generation).toMatchObject({ model: "test-model", rounds: 1 });
  });

  it("개인정보로 보이는 값은 AI 전송과 저장 전에 가림", async () => {
    const { service, seenPrompts } = setup({ title: "", steps: [iceStep], rejectReason: null });

    const guide = await service.createFromManual({ manual: MANUAL });

    expect(seenPrompts[0]).not.toContain("010-1234-5678");
    expect(guide.manual).not.toContain("010-1234-5678");
    expect(guide.maskedCount).toBe(1);
  });

  it("업무 매뉴얼이 아니면 저장하지 않고 거절", async () => {
    const { service } = setup({ title: "", steps: [], rejectReason: "순서 없음" });

    expect(await errorCode(() => service.createFromManual({ manual: MANUAL }))).toBe(
      "MANUAL_REJECTED",
    );
    expect((await service.list()).filter((guide) => !guide.isSample)).toEqual([]);
  });

  it("승인 전 가이드는 근로자 화면에서 제외", async () => {
    const { service } = setup({ title: "", steps: [iceStep], rejectReason: null });
    const guide = await service.createFromManual({ manual: MANUAL });

    expect((await service.listApproved()).map((item) => item.id)).not.toContain(guide.id);
    expect(await errorCode(() => service.getApproved(guide.id))).toBe("GUIDE_NOT_FOUND");

    await service.approve(guide.id, { acknowledgeIssues: false });

    expect((await service.listApproved()).map((item) => item.id)).toContain(guide.id);
  });

  it("점검 경고가 남은 가이드는 확인 없이 승인 불가", async () => {
    const { service } = setup({ title: "", steps: [ungroundedStep], rejectReason: null });
    const guide = await service.createFromManual({ manual: MANUAL });

    expect(await errorCode(() => service.approve(guide.id, { acknowledgeIssues: false }))).toBe(
      "GUIDE_HAS_ISSUES",
    );

    const approved = await service.approve(guide.id, { acknowledgeIssues: true });
    expect(approved.status).toBe("approved");
  });

  it("원문 내용이 단계에 없으면 누락으로 표시하고 확인 없이 승인 불가", async () => {
    const { service } = setup({ title: "", steps: [iceStep], rejectReason: null });
    const manual = "컵에 얼음을 가득 채운다. 손님에게 5분 안에 건넨다.";

    const guide = await service.createFromManual({ manual });

    expect(guide.uncovered).toEqual(["손님에게 5분 안에 건넨다"]);
    expect(await errorCode(() => service.approve(guide.id, { acknowledgeIssues: false }))).toBe(
      "GUIDE_HAS_ISSUES",
    );
  });

  it("승인 후 수정하면 초안으로 돌아가고 다시 점검", async () => {
    const { service } = setup({ title: "", steps: [iceStep], rejectReason: null });
    const guide = await service.createFromManual({ manual: MANUAL });
    await service.approve(guide.id, { acknowledgeIssues: false });

    const updated = await service.update(guide.id, {
      title: "음료 준비",
      steps: [{ ...toInput(guide.steps[0]), action: "얼음을 넣고 뚜껑을 닫아요" }],
    });

    expect(updated.status).toBe("draft");
    expect(updated.approvedAt).toBeNull();
    expect(updated.steps[0].editedByCoach).toBe(true);
    expect(updated.steps[0].issues.map((issue) => issue.code)).toContain("MULTI_ACTION");
  });

  it("내용을 바꾸지 않은 단계는 코치 수정으로 표시하지 않음", async () => {
    const { service } = setup({ title: "", steps: [iceStep], rejectReason: null });
    const guide = await service.createFromManual({ manual: MANUAL });

    const updated = await service.update(guide.id, {
      title: "새 제목",
      steps: [toInput(guide.steps[0])],
    });

    expect(updated.steps[0].id).toBe(guide.steps[0].id);
    expect(updated.steps[0].editedByCoach).toBe(false);
  });

  it("기본 가이드는 승인된 상태로 항상 제공", async () => {
    const { service } = setup({ title: "", steps: [], rejectReason: null });

    const approved = await service.listApproved();

    expect(approved.map((guide) => guide.id)).toContain(SAMPLE_GUIDE_ID);
  });

  it("기본 가이드 전체를 정의한 순서대로 제공", async () => {
    const { service } = setup({ title: "", steps: [], rejectReason: null });

    const guides = await service.list();

    expect(guides.map((guide) => guide.id)).toEqual(
      SAMPLE_DEFINITIONS.map((definition) => definition.id),
    );
    expect(guides.every((guide) => guide.status === "approved" && guide.isSample)).toBe(true);
  });

  it("목록을 거치지 않아도 기본 가이드를 바로 조회", async () => {
    const { service } = setup({ title: "", steps: [], rejectReason: null });
    const last = SAMPLE_DEFINITIONS.at(-1)!;

    const guide = await service.getApproved(last.id);

    expect(guide.title).toBe(last.title);
    expect(guide.steps[0].id).toBe(`${last.stepPrefix}_1`);
  });

  it("근로자용 응답에서 원문과 점검 결과 제외", async () => {
    const { service } = setup({ title: "", steps: [], rejectReason: null });

    const worker = toWorkerGuide(await service.getApproved(SAMPLE_GUIDE_ID));

    expect(JSON.stringify(worker)).not.toContain("sourceQuote");
    expect(worker).not.toHaveProperty("manual");
  });
});
