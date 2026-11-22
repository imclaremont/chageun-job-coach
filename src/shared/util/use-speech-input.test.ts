import { describe, expect, it } from "vitest";
import { isFinalResult, readTranscript, toSpeechInputError } from "./use-speech-input";

describe("toSpeechInputError", () => {
  it("마이크 권한이 없으면 denied", () => {
    expect(toSpeechInputError("not-allowed")).toBe("denied");
    expect(toSpeechInputError("service-not-allowed")).toBe("denied");
  });

  it("들린 말이 없으면 silent", () => {
    expect(toSpeechInputError("no-speech")).toBe("silent");
  });

  it("직접 멈춘 경우는 안내 없음", () => {
    expect(toSpeechInputError("aborted")).toBeNull();
  });

  it("그 밖의 오류는 failed", () => {
    expect(toSpeechInputError("network")).toBe("failed");
    expect(toSpeechInputError("audio-capture")).toBe("failed");
  });
});

describe("readTranscript", () => {
  it("인식 결과의 첫 후보를 이어 붙이고 공백 정리", () => {
    const event = {
      results: [
        [{ transcript: " 우유가  어디에 " }, { transcript: "다른 후보" }],
        [{ transcript: "있어요" }],
      ],
    };

    expect(readTranscript(event)).toBe("우유가 어디에 있어요");
  });

  it("결과가 비어 있으면 빈 문자열", () => {
    expect(readTranscript({ results: [] })).toBe("");
  });
});

describe("isFinalResult", () => {
  it("마지막 결과가 확정이면 true", () => {
    const result = Object.assign([{ transcript: "얼음은 어디에 있어요" }], { isFinal: true });

    expect(isFinalResult({ results: [result] })).toBe(true);
  });

  it("중간 결과이거나 결과가 없으면 false", () => {
    const result = Object.assign([{ transcript: "얼음은" }], { isFinal: false });

    expect(isFinalResult({ results: [result] })).toBe(false);
    expect(isFinalResult({ results: [] })).toBe(false);
  });
});
