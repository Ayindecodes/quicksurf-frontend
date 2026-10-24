import { describe, expect, it } from "vitest";

import { deviceId } from "./device";
import { clearTokens, saveTokens } from "./tokens";

describe("deviceId", () => {
  it("is created once and kept, even when the user signs out", () => {
    const first = deviceId();
    saveTokens({ access: "A", refresh: "R" }, true);
    clearTokens();

    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(deviceId()).toBe(first);
  });
});
