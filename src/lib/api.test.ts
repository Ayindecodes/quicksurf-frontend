import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, request, SESSION_EXPIRED_EVENT, toApiError } from "./api";
import { API_ROOT } from "./config";
import { readTokens, saveTokens } from "./tokens";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const envelope = (code: string, message: string, more: Record<string, unknown> = {}) => ({
  error: { code, message, ...more },
  request_id: "req-123",
});

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toApiError", () => {
  it("reads the v1 error envelope, keeping field errors and extra values", () => {
    const error = toApiError(
      403,
      envelope("pin_invalid", "Wrong PIN.", { attempts_left: 3, fields: { pin: ["Too short."], nested: { a: ["Bad."] } } }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("pin_invalid");
    expect(error.message).toBe("Wrong PIN.");
    expect(error.extra).toEqual({ attempts_left: 3 });
    expect(error.field("pin")).toBe("Too short.");
    expect(error.fields.nested).toEqual(["Bad."]);
    expect(error.requestId).toBe("req-123");
  });

  it("falls back to a readable message when the body isn't an envelope", () => {
    expect(toApiError(502, "<html>Bad gateway</html>").message).toMatch(/our side/);
    expect(toApiError(429, null).message).toMatch(/Too many attempts/);
  });
});

describe("request", () => {
  it("sends the access token and parses JSON", async () => {
    saveTokens({ access: "A1", refresh: "R1" }, true);
    fetchMock.mockResolvedValueOnce(json(200, { balance: "10.00", locked: "0.00" }));

    await expect(request("/wallet/")).resolves.toEqual({ balance: "10.00", locked: "0.00" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_ROOT}/wallet/`);
    expect(init.headers.Authorization).toBe("Bearer A1");
    expect(init.credentials).toBe("omit");
    expect(init.headers["X-Device-Id"]).toBe(localStorage.getItem("qs_device"));
  });

  it("refreshes once on 401, stores the rotated refresh token, and retries", async () => {
    saveTokens({ access: "old", refresh: "R1" }, true);
    fetchMock
      .mockResolvedValueOnce(json(401, envelope("token_not_valid", "Token expired")))
      .mockResolvedValueOnce(json(200, { access: "new", refresh: "R2" }))
      .mockResolvedValueOnce(json(200, { ok: true }));

    await expect(request("/users/me/")).resolves.toEqual({ ok: true });
    expect(fetchMock.mock.calls[1][0]).toBe(`${API_ROOT}/token/refresh/`);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ refresh: "R1" });
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe("Bearer new");
    expect(readTokens()).toEqual({ access: "new", refresh: "R2" });
  });

  it("shares one refresh between requests that fail at the same time", async () => {
    saveTokens({ access: "old", refresh: "R1" }, true);
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (url.endsWith("/token/refresh/")) return json(200, { access: "new", refresh: "R2" });
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === "Bearer new" ? json(200, { url }) : json(401, envelope("token_not_valid", "expired"));
    });

    await Promise.all([request("/wallet/"), request("/rewards/"), request("/users/me/")]);

    const refreshes = fetchMock.mock.calls.filter(([url]) => String(url).endsWith("/token/refresh/"));
    expect(refreshes).toHaveLength(1);
  });

  it("signs out when the refresh token is rejected", async () => {
    saveTokens({ access: "old", refresh: "R1" }, true);
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    fetchMock
      .mockResolvedValueOnce(json(401, envelope("token_not_valid", "expired")))
      .mockResolvedValueOnce(json(401, envelope("token_not_valid", "blacklisted")));

    await expect(request("/wallet/")).rejects.toMatchObject({ status: 401 });
    expect(readTokens()).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  });

  it("keeps the session when the connection drops during a refresh", async () => {
    saveTokens({ access: "old", refresh: "R1" }, true);
    fetchMock
      .mockResolvedValueOnce(json(401, envelope("token_not_valid", "expired")))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(request("/wallet/")).rejects.toMatchObject({ code: "network_error" });
    expect(readTokens()).toEqual({ access: "old", refresh: "R1" });
  });

  it("doesn't send tokens or refresh for sign-in", async () => {
    saveTokens({ access: "A1", refresh: "R1" }, true);
    fetchMock.mockResolvedValueOnce(json(401, envelope("authentication_failed", "Invalid credentials")));

    await expect(
      request("/users/login/", { method: "POST", body: { email: "a@b.c", password: "x" }, auth: false }),
    ).rejects.toMatchObject({ status: 401, code: "authentication_failed" });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("turns a failed connection into a network_error", async () => {
    saveTokens({ access: "A1", refresh: "R1" }, true);
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(request("/wallet/")).rejects.toMatchObject({ status: 0, code: "network_error" });
  });
});

describe("errorMessage", () => {
  it("adds the request ID to server errors so support can find them", async () => {
    const { errorMessage } = await import("./api");
    const serverError = toApiError(500, envelope("server_error", "Something went wrong.", {}));
    const refused = toApiError(400, envelope("insufficient_funds", "Insufficient funds."));

    expect(errorMessage(serverError)).toBe("Something went wrong. If it keeps happening, contact support and quote req-123.");
    expect(errorMessage(refused)).toBe("Insufficient funds.");
    expect(errorMessage(new Error("boom"))).toBe("Something went wrong. Please try again.");
  });
});
