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

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const prefix = apiBase ? `${apiBase}/api` : "/api";
  return `${prefix}${p}`;
}

export function analyzeUrl(): string {
  return apiUrl("/analyze");
}
