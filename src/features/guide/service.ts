import "server-only";
import { AppError, ErrorCode } from "@/shared/error";
import { createId } from "@/shared/util/id";
import { logger } from "@/shared/util/logger";
import { maskPersonalInfo } from "@/shared/util/mask";
import { generateGuide, type StructuredGenerator } from "./agent/generate-guide";
import { findUncoveredClauses } from "./coverage";
import { checkSteps } from "./easy-read";
import type { GuideRepository } from "./repository";
import { buildSampleGuide, buildSampleGuides, isSampleGuideId } from "./sample";
import { countIssues } from "./schema";
import type {
  ApproveGuideRequest,
  CreateGuideRequest,
  DraftStep,
  Guide,
  Step,
  UpdateGuideRequest,
} from "./schema";

type Dependencies = {
  repository: GuideRepository;
  generate: StructuredGenerator;
  modelName: () => string;
  now?: () => Date;
};

export type GuideService = ReturnType<typeof createGuideService>;

const DRAFT_FIELDS = ["action", "detail", "emoji", "caution", "doneCheck", "sourceQuote"] as const;

const sameContent = (a: DraftStep, b: DraftStep) =>
  DRAFT_FIELDS.every((field) => (a[field] ?? "") === (b[field] ?? ""));

export function createGuideService({ repository, generate, modelName, now }: Dependencies) {
  const timestamp = () => (now?.() ?? new Date()).toISOString();

  // 저장소에 없는 기본 가이드를 채워 넣은 전체 목록
  async function withSamples(guides: Guide[]): Promise<Guide[]> {
    const missing = buildSampleGuides().filter(
      (sample) => !guides.some((guide) => guide.id === sample.id),
    );
    await Promise.all(missing.map((sample) => repository.save(sample)));
    return [...guides, ...missing];
  }

  async function get(id: string): Promise<Guide> {
    const stored = await repository.findById(id);
    if (stored) return stored;
    if (!isSampleGuideId(id)) throw new AppError(ErrorCode.GUIDE_NOT_FOUND, { detail: id });
    const sample = buildSampleGuide(id);
    await repository.save(sample);
    return sample;
  }

  return {
    get,

    async list(): Promise<Guide[]> {
      const guides = await withSamples(await repository.findAll());
      return guides.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    // 근로자 화면에는 승인된 가이드만 노출
    async listApproved(): Promise<Guide[]> {
      const guides = await this.list();
      return guides.filter((guide) => guide.status === "approved");
    },

    async getApproved(id: string): Promise<Guide> {
      const guide = await get(id);
      if (guide.status !== "approved") {
        throw new AppError(ErrorCode.GUIDE_NOT_FOUND, { detail: `${id} not approved` });
      }
      return guide;
    },

    async createFromManual(request: CreateGuideRequest): Promise<Guide> {
      // 외부 AI 전송과 저장 전에 개인정보로 보이는 값 가림
      const { text: manual, maskedCount } = maskPersonalInfo(request.manual);
      const result = await generateGuide({ manual, titleHint: request.title }, generate);

      if (result.rejectReason) {
        throw new AppError(ErrorCode.MANUAL_REJECTED, { detail: result.rejectReason });
      }

      const createdAt = timestamp();
      const guide: Guide = {
        id: createId("g"),
        title: request.title || result.title || "새 업무",
        workplace: request.workplace || "",
        manual,
        steps: result.steps.map((step, index) => ({
          ...step,
          id: createId("s"),
          issues: result.issuesByStep[index] ?? [],
          editedByCoach: false,
        })),
        uncovered: result.uncovered,
        status: "draft",
        isSample: false,
        maskedCount,
        generation: {
          model: modelName(),
          rounds: result.rounds,
          issuesFound: result.issuesFound,
          issuesRemaining: result.issuesRemaining,
        },
        createdAt,
        updatedAt: createdAt,
        approvedAt: null,
      };
      await repository.save(guide);
      logger.info("guide generated", {
        guideId: guide.id,
        stepCount: guide.steps.length,
        rounds: result.rounds,
        issuesRemaining: result.issuesRemaining,
      });
      return guide;
    },

    // 코치 수정 반영, 수정 후에는 다시 승인 필요
    async update(id: string, request: UpdateGuideRequest): Promise<Guide> {
      const guide = await get(id);
      const existing = new Map(guide.steps.map((step) => [step.id, step]));

      const drafts: DraftStep[] = request.steps.map((input) => ({
        action: input.action,
        detail: input.detail,
        emoji: input.emoji,
        caution: input.caution || null,
        doneCheck: input.doneCheck,
        sourceQuote: input.sourceQuote,
      }));
      const issuesByStep = checkSteps(drafts, guide.manual);

      const steps: Step[] = drafts.map((draft, index) => {
        const inputId = request.steps[index].id;
        const previous = inputId ? existing.get(inputId) : undefined;
        return {
          ...draft,
          id: previous?.id ?? createId("s"),
          issues: issuesByStep[index],
          editedByCoach: previous ? previous.editedByCoach || !sameContent(previous, draft) : true,
        };
      });

      const updated: Guide = {
        ...guide,
        title: request.title,
        steps,
        uncovered: findUncoveredClauses(guide.manual, steps),
        status: "draft",
        approvedAt: null,
        updatedAt: timestamp(),
      };
      await repository.save(updated);
      return updated;
    },

    async approve(id: string, request: ApproveGuideRequest): Promise<Guide> {
      const guide = await get(id);
      if (countIssues(guide) > 0 && !request.acknowledgeIssues) {
        throw new AppError(ErrorCode.GUIDE_HAS_ISSUES, { detail: id });
      }
      const approvedAt = timestamp();
      const approved: Guide = { ...guide, status: "approved", approvedAt, updatedAt: approvedAt };
      await repository.save(approved);
      logger.info("guide approved", { guideId: id, stepCount: guide.steps.length });
      return approved;
    },
  };
}
