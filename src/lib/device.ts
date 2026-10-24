// src/lib/device.ts
// A random ID for this browser, sent as X-Device-Id so the API can notice one device running many
// accounts (a fraud check). It identifies nothing about the person and survives signing out.

const KEY = "qs_device";

export function deviceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null; // storage blocked: the API copes without it
  }
}
