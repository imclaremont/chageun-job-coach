import { describe, expect, it } from "vitest";
import { buildSampleGuide, SAMPLE_GUIDE_ID } from "@/features/guide/sample";
import { createMemoryStore } from "@/infra/store/memory-store";
import { AppError } from "@/shared/error";
import { createProgressRepository } from "./repository";
import { toRunResponse } from "./schema";
import { createProgressService, SIMPLE_MODE_STREAK } from "./service";

const guide = buildSampleGuide();
const start = { guideId: SAMPLE_GUIDE_ID, workerId: "w_haneul", mode: "full" as const };

function setup() {
  const store = createMemoryStore();
  let tick = 0;
  return createProgressService({
    repository: createProgressRepository(() => store),
    getApprovedGuide: async () => guide,
    // 호출마다 1초씩 흐르는 시계, 최신순 정렬 확인용
    now: () => new Date(Date.UTC(2026, 10, 22, 9, 0, (tick += 1))),
  });
}

async function finish(service: ReturnType<typeof setup>, runId: string) {
  for (const step of guide.steps) await service.completeStep(runId, step.id);
}

const errorCode = async (run: () => Promise<unknown>) => {
  try {
    await run();
  } catch (error) {
    if (error instanceof AppError) return error.errorCode.code;
    throw error;
  }
  return null;
};

describe("progressService", () => {
  it("수행 시작 시 가이드의 모든 단계를 미완료로 준비", async () => {
    const service = setup();

    const run = await service.startRun(start);

    expect(run).toMatchObject({ workerName: "하늘", status: "in_progress", currentIndex: 0 });
    expect(run.stepLogs).toHaveLength(guide.steps.length);
  });

  it("단계를 끝낼 때마다 다음 단계로 이동, 마지막 단계에서 완료", async () => {
    const service = setup();
    const run = await service.startRun(start);

    const afterFirst = await service.completeStep(run.id, guide.steps[0].id);
    expect(afterFirst.currentIndex).toBe(1);

    await finish(service, run.id);
    const done = toRunResponse(await service.getRun(run.id));

    expect(done.status).toBe("done");
    expect(done.finishedAt).not.toBeNull();
    expect(done.currentIndex).toBe(done.totalSteps);
  });

  it("같은 단계를 두 번 끝내도 기록은 한 번", async () => {
    const service = setup();
    const run = await service.startRun(start);

    const first = await service.completeStep(run.id, guide.steps[0].id);
    const second = await service.completeStep(run.id, guide.steps[0].id);

    expect(second.stepLogs[0].doneAt).toBe(first.stepLogs[0].doneAt);
    expect(second.currentIndex).toBe(1);
  });

  it("없는 근로자, 수행, 단계는 거부", async () => {
    const service = setup();
    const run = await service.startRun(start);

    expect(await errorCode(() => service.startRun({ ...start, workerId: "nobody" }))).toBe(
      "WORKER_NOT_FOUND",
    );
    expect(await errorCode(() => service.getRun("r_none"))).toBe("RUN_NOT_FOUND");
    expect(await errorCode(() => service.completeStep(run.id, "s_none"))).toBe("STEP_NOT_FOUND");
  });

  it(`도움 없이 ${SIMPLE_MODE_STREAK}번 연속 끝내면 간단 보기 추천`, async () => {
    const service = setup();

    for (let count = 0; count < SIMPLE_MODE_STREAK; count += 1) {
      expect(await service.isSimpleRecommended(start.workerId, start.guideId)).toBe(false);
      const run = await service.startRun(start);
      await finish(service, run.id);
    }

    expect(await service.isSimpleRecommended(start.workerId, start.guideId)).toBe(true);
  });

  it("최근 수행에서 도움을 받았으면 간단 보기 추천 안 함", async () => {
    const service = setup();
    const clean = await service.startRun(start);
    await finish(service, clean.id);
    const helped = await service.startRun(start);
    await service.countHelp(helped.id, guide.steps[0].id);
    await finish(service, helped.id);

    expect(await service.isSimpleRecommended(start.workerId, start.guideId)).toBe(false);
  });

  it("대시보드에 진행 중인 수행과 오늘 끝낸 수행 집계", async () => {
    const service = setup();
    const active = await service.startRun(start);
    await service.completeStep(active.id, guide.steps[0].id);
    const done = await service.startRun({ ...start, workerId: "w_bada" });
    await finish(service, done.id);

    const dashboard = await service.dashboard();

    expect(dashboard.summary).toMatchObject({ activeCount: 1, doneTodayCount: 1 });
    expect(dashboard.activeRuns[0]).toMatchObject({ workerName: "하늘", doneSteps: 1 });
    expect(dashboard.recentDone[0]).toMatchObject({ workerName: "바다", status: "done" });
  });
});
