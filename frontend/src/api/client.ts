/**
 * Base URL for API calls (no trailing slash).
 * - If `VITE_API_BASE_URL` is unset or blank, in **dev** we use "" so requests are same-origin
 *   and Vite's `server.proxy` forwards `/api` to Spring Boot.
 * - In production builds, blank falls back to `http://localhost:8080` (override with env for deploy).
 */
function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (trimmed !== "") {
    return trimmed.replace(/\/+$/, "");
  }
  if (import.meta.env.DEV) {
    return "";
  }
  return "http://localhost:8080";
}

export const apiBase = resolveApiBase();

/** Path must start with `/` (e.g. `/analyze`, `/analyses/recent`). */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const prefix = apiBase ? `${apiBase}/api` : "/api";
  return `${prefix}${p}`;
}

export function analyzeUrl(): string {
  return apiUrl("/analyze");
}
