// src/lib/config.ts
/** The backend's origin, e.g. https://api.quicksurf.ng (NEXT_PUBLIC_API_BASE; a trailing /api is ignored). */
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000")
  .replace(/\/+$/, "")
  .replace(/\/api(\/v1)?$/i, "");

export const API_ROOT = `${API_ORIGIN}/api/v1`;
