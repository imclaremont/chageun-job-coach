import "server-only";
import type { KeyValueStore } from "@/infra/store";
import { HelpRequestSchema, RunSchema, type HelpRequest, type Run } from "./schema";

const RUN_PREFIX = "run:";
const HELP_PREFIX = "help:";

export type ProgressRepository = ReturnType<typeof createProgressRepository>;

// 수행 기록과 도움 요청 저장소 접근
export function createProgressRepository(getStore: () => KeyValueStore) {
  return {
    async findRun(id: string): Promise<Run | null> {
      const raw = await getStore().get<unknown>(`${RUN_PREFIX}${id}`);
      return raw === null ? null : RunSchema.parse(raw);
    },
    async findAllRuns(): Promise<Run[]> {
      const raws = await getStore().list<unknown>(RUN_PREFIX);
      return raws.map((raw) => RunSchema.parse(raw));
    },
    async saveRun(run: Run): Promise<void> {
      await getStore().set(`${RUN_PREFIX}${run.id}`, run);
    },
    async findHelp(id: string): Promise<HelpRequest | null> {
      const raw = await getStore().get<unknown>(`${HELP_PREFIX}${id}`);
      return raw === null ? null : HelpRequestSchema.parse(raw);
    },
    async findAllHelp(): Promise<HelpRequest[]> {
      const raws = await getStore().list<unknown>(HELP_PREFIX);
      return raws.map((raw) => HelpRequestSchema.parse(raw));
    },
    async saveHelp(help: HelpRequest): Promise<void> {
      await getStore().set(`${HELP_PREFIX}${help.id}`, help);
    },
  };
}
