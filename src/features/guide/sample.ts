import { EXTRA_SAMPLES, type SampleDefinition } from "./sample-extra";
import type { DraftStep, Guide } from "./schema";

// 처음 접속했을 때 바로 써 볼 수 있는 기본 가이드, 가상 매장의 가상 매뉴얼
export const SAMPLE_GUIDE_ID = "g_sample_americano";

export const SAMPLE_MANUAL = `[카페 차근] 아이스 아메리카노 만들기

1. 손을 비누로 30초 동안 씻는다.
2. 아이스 컵(16온스)을 꺼내 컵 받침대에 올린다.
3. 제빙기에서 얼음 스쿱으로 얼음을 떠서 컵 끝까지 채운다.
4. 정수기 찬물을 컵의 물 선까지 붓는다.
5. 포터필터에 원두 가루를 담고 탬퍼로 눌러 평평하게 만든다.
6. 포터필터를 커피 머신에 끼우고 추출 버튼(2잔)을 누른다. 이때 머신과 포터필터가 뜨거우니 손잡이만 잡는다.
7. 샷 잔에 에스프레소가 선까지 차면 버튼이 꺼진다. 샷을 얼음 컵에 붓는다.
8. 뚜껑을 닫고 빨대를 꽂아 손님에게 건넨다.
9. 포터필터의 커피 찌꺼기는 찌꺼기 통에 털어 버린다.`;

export const SAMPLE_STEPS: DraftStep[] = [
  {
    action: "손을 씻어요",
    detail: "비누로 30초 동안 씻어요.",
    emoji: "🧼",
    caution: null,
    doneCheck: "손을 깨끗이 씻었어요",
    sourceQuote: "손을 비누로 30초 동안 씻는다",
  },
  {
    action: "아이스 컵을 받침대에 올려요",
    detail: "16온스 컵을 꺼내요.",
    emoji: "🥤",
    caution: null,
    doneCheck: "컵을 받침대에 올렸어요",
    sourceQuote: "아이스 컵(16온스)을 꺼내 컵 받침대에 올린다",
  },
  {
    action: "컵에 얼음을 채워요",
    detail: "얼음 스쿱으로 떠요. 컵 끝까지 채워요.",
    emoji: "🧊",
    caution: null,
    doneCheck: "얼음이 컵 끝까지 찼어요",
    sourceQuote: "제빙기에서 얼음 스쿱으로 얼음을 떠서 컵 끝까지 채운다",
  },
  {
    action: "찬물을 부어요",
    detail: "정수기 찬물을 써요. 컵의 물 선까지 부어요.",
    emoji: "💧",
    caution: null,
    doneCheck: "물이 물 선까지 찼어요",
    sourceQuote: "정수기 찬물을 컵의 물 선까지 붓는다",
  },
  {
    action: "포터필터에 원두 가루를 담아요",
    detail: "",
    emoji: "☕",
    caution: null,
    doneCheck: "원두 가루를 담았어요",
    sourceQuote: "포터필터에 원두 가루를 담고",
  },
  {
    action: "탬퍼로 가루를 눌러요",
    detail: "가루가 평평해질 때까지 눌러요.",
    emoji: "👇",
    caution: null,
    doneCheck: "가루가 평평해졌어요",
    sourceQuote: "탬퍼로 눌러 평평하게 만든다",
  },
  {
    action: "포터필터를 커피 머신에 끼워요",
    detail: "손잡이를 잡아요.",
    emoji: "🔧",
    caution: "머신과 포터필터가 뜨거워요. 손잡이만 잡아요.",
    doneCheck: "포터필터를 끼웠어요",
    sourceQuote: "포터필터를 커피 머신에 끼우고",
  },
  {
    action: "추출 버튼을 눌러요",
    detail: "2잔 버튼을 눌러요.",
    emoji: "🔘",
    caution: null,
    doneCheck: "버튼을 눌렀어요",
    sourceQuote: "추출 버튼(2잔)을 누른다",
  },
  {
    action: "버튼이 꺼질 때까지 기다려요",
    detail: "샷 잔의 선까지 차면 버튼이 꺼져요.",
    emoji: "⏳",
    caution: null,
    doneCheck: "버튼이 꺼졌어요",
    sourceQuote: "샷 잔에 에스프레소가 선까지 차면 버튼이 꺼진다",
  },
  {
    action: "샷을 얼음 컵에 부어요",
    detail: "",
    emoji: "🫗",
    caution: null,
    doneCheck: "샷을 다 부었어요",
    sourceQuote: "샷을 얼음 컵에 붓는다",
  },
  {
    action: "뚜껑을 닫아요",
    detail: "",
    emoji: "✅",
    caution: null,
    doneCheck: "뚜껑을 꼭 닫았어요",
    sourceQuote: "뚜껑을 닫고",
  },
  {
    action: "손님에게 음료를 드려요",
    detail: "빨대를 꽂아서 드려요.",
    emoji: "🙋",
    caution: null,
    doneCheck: "손님이 음료를 받았어요",
    sourceQuote: "빨대를 꽂아 손님에게 건넨다",
  },
  {
    action: "커피 찌꺼기를 버려요",
    detail: "찌꺼기 통에 털어요.",
    emoji: "🗑️",
    caution: null,
    doneCheck: "포터필터가 비었어요",
    sourceQuote: "포터필터의 커피 찌꺼기는 찌꺼기 통에 털어 버린다",
  },
];

// 처음 접속했을 때 보이는 기본 가이드 전체, 첫 번째가 맨 위에 오도록 정렬
export const SAMPLE_DEFINITIONS: SampleDefinition[] = [
  {
    id: SAMPLE_GUIDE_ID,
    stepPrefix: "s_sample",
    title: "아이스 아메리카노 만들기",
    workplace: "카페 차근",
    manual: SAMPLE_MANUAL,
    steps: SAMPLE_STEPS,
  },
  ...EXTRA_SAMPLES,
];

const SAMPLE_BASE_TIME = Date.UTC(2026, 10, 22);
const MINUTE_MS = 60_000;

export const isSampleGuideId = (id: string) =>
  SAMPLE_DEFINITIONS.some((definition) => definition.id === id);

export function buildSampleGuide(id: string = SAMPLE_GUIDE_ID): Guide {
  const index = SAMPLE_DEFINITIONS.findIndex((definition) => definition.id === id);
  const definition = SAMPLE_DEFINITIONS[Math.max(index, 0)];
  // 목록은 최근 수정 순이므로 정의한 순서대로 보이게 시각을 1분씩 앞당김
  const createdAt = new Date(SAMPLE_BASE_TIME - Math.max(index, 0) * MINUTE_MS).toISOString();

  return {
    id: definition.id,
    title: definition.title,
    workplace: definition.workplace,
    manual: definition.manual,
    steps: definition.steps.map((step, stepIndex) => ({
      ...step,
      id: `${definition.stepPrefix}_${stepIndex + 1}`,
      issues: [],
      editedByCoach: false,
    })),
    uncovered: [],
    status: "approved",
    isSample: true,
    maskedCount: 0,
    generation: null,
    createdAt,
    updatedAt: createdAt,
    approvedAt: createdAt,
  };
}

export const buildSampleGuides = (): Guide[] =>
  SAMPLE_DEFINITIONS.map((definition) => buildSampleGuide(definition.id));
