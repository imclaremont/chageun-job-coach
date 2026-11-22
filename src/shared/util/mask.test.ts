import { describe, expect, it } from "vitest";
import { maskPersonalInfo } from "./mask";

describe("maskPersonalInfo", () => {
  it("전화번호, 이메일, 주민등록번호 가림", () => {
    const { text, maskedCount } = maskPersonalInfo(
      "담당 010-1234-5678, sample@example.com, 900101-1234567",
    );

    expect(text).not.toMatch(/010-1234-5678|sample@example\.com|900101-1234567/);
    expect(maskedCount).toBe(3);
  });

  it("업무 수치는 그대로 유지", () => {
    const manual = "얼음을 16온스 컵에 채우고 30초 동안 2잔 버튼을 누른다";

    expect(maskPersonalInfo(manual)).toEqual({ text: manual, maskedCount: 0 });
  });
});
