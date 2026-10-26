import { describe, expect, it } from "vitest";

import { clearTokens, readTokens, saveTokens } from "./tokens";

describe("tokens", () => {
  it("keeps tokens for this tab only unless the user asks to stay signed in", () => {
    saveTokens({ access: "A", refresh: "R" }, false);
    expect(sessionStorage.getItem("qs_refresh")).toBe("R");
    expect(localStorage.getItem("qs_refresh")).toBeNull();

    saveTokens({ access: "A2", refresh: "R2" }, true);
    expect(localStorage.getItem("qs_refresh")).toBe("R2");
    expect(sessionStorage.getItem("qs_refresh")).toBeNull();
  });

  it("stores rotated tokens where the session already lives", () => {
    saveTokens({ access: "A", refresh: "R" }, false);
    saveTokens({ access: "A2", refresh: "R2" });

    expect(sessionStorage.getItem("qs_refresh")).toBe("R2");
    expect(readTokens()).toEqual({ access: "A2", refresh: "R2" });
  });

  it("clears the old frontend's keys too", () => {
    localStorage.setItem("access", "legacy");
    localStorage.setItem("refresh", "legacy");
    saveTokens({ access: "A", refresh: "R" }, true);
    expect(localStorage.getItem("access")).toBeNull();

    clearTokens();
    expect(readTokens()).toBeNull();
  });
});
