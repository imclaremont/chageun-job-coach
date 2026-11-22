import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toStrictJsonSchema } from "./json-schema";

describe("toStrictJsonSchema", () => {
  const schema = z.object({
    title: z.string().min(1).max(60),
    steps: z
      .array(z.object({ action: z.string(), caution: z.string().nullable() }))
      .min(1)
      .max(15),
  });

  it("strict 모드가 받지 않는 제약 제거", () => {
    const json = JSON.stringify(toStrictJsonSchema(schema));

    expect(json).not.toMatch(/\$schema|minItems|maxItems|minLength|maxLength/);
  });

  it("모든 속성을 필수로, 추가 속성은 금지로 유지", () => {
    const result = toStrictJsonSchema(schema) as {
      required: string[];
      additionalProperties: boolean;
      properties: { steps: { items: { required: string[]; additionalProperties: boolean } } };
    };

    expect(result.required).toEqual(["title", "steps"]);
    expect(result.additionalProperties).toBe(false);
    expect(result.properties.steps.items.required).toEqual(["action", "caution"]);
    expect(result.properties.steps.items.additionalProperties).toBe(false);
  });
});
