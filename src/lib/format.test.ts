import { describe, expect, it } from "vitest";

import { naira, normalizePhone, safeNext, signedNaira } from "./format";

describe("format", () => {
  it("formats naira", () => {
    expect(naira("1500")).toBe("₦1,500.00");
    expect(naira(50)).toBe("₦50.00");
    expect(naira("not a number")).toBe("—");
    expect(signedNaira("-300.00")).toBe("−₦300.00");
    expect(signedNaira("2000.00")).toBe("+₦2,000.00");
  });

  it("normalises Nigerian numbers like the backend", () => {
    expect(normalizePhone("0803 123 4567")).toBe("08031234567");
    expect(normalizePhone("+234 803 123 4567")).toBe("08031234567");
    expect(normalizePhone("23408031234567")).toBe("08031234567");
    expect(normalizePhone("803123456")).toBe("");
    expect(normalizePhone("+44 7700 900123")).toBe("");
  });

  it("only returns to pages on this site after sign-in", () => {
    expect(safeNext("/dashboard/data")).toBe("/dashboard/data");
    expect(safeNext("https://evil.example")).toBe("/dashboard");
    expect(safeNext("//evil.example")).toBe("/dashboard");
    expect(safeNext("/\\evil.example")).toBe("/dashboard");
    expect(safeNext(null)).toBe("/dashboard");
  });
});
