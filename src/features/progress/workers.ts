// 시연용 가상 근로자, 실제 인물과 무관
export type Worker = { id: string; name: string; emoji: string };

export const WORKERS: Worker[] = [
  { id: "w_haneul", name: "하늘", emoji: "🌤️" },
  { id: "w_bada", name: "바다", emoji: "🌊" },
  { id: "w_namu", name: "나무", emoji: "🌳" },
];

export const findWorker = (id: string) => WORKERS.find((worker) => worker.id === id) ?? null;
