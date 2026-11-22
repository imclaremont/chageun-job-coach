import { describe, expect, it } from "vitest";
import { mentionsInjury } from "./safety";

describe("mentionsInjury", () => {
  it.each([
    "다쳤어요",
    "손을 다쳐서 못 해요",
    "손이 아파요",
    "배가 너무 아픕니다",
    "손에서 피가 나요",
    "피 났어요",
    "뜨거운 물에 데었어요",
    "손가락을 뎄어요",
    "칼에 베였어요",
    "가위에 찔렸어요",
    "바닥에서 넘어졌어요",
    "문에 부딪혔어요",
    "발목을 삐었어요",
    "머리가 어지러워요",
    "숨이 안 쉬어져요",
  ])("다쳤거나 아프다는 말로 판별: %s", (text) => {
    expect(mentionsInjury(text)).toBe(true);
  });

  it.each([
    "어디에 있어요?",
    "얼음을 얼마나 넣어요?",
    "커피가 안 나와요",
    "커피가 나왔어요",
    "우유를 얼마나 데워요?",
    "뚜껑이 안 닫혀요",
    "안 다쳤어요",
    "이제 안 아파요",
    "아파트 손님이 왔어요",
  ])("업무 질문은 해당 없음: %s", (text) => {
    expect(mentionsInjury(text)).toBe(false);
  });
});
