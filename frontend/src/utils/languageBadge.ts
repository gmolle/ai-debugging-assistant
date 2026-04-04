import type { Language } from "../types/analysis";

/** Muted badge styles for dark UI; keys must match API `language` strings. */
const LANGUAGE_BADGE: Record<Language, string> = {
  "C#": "border-violet-500/35 bg-violet-950/45 text-violet-200/95",
  "C++": "border-indigo-500/35 bg-indigo-950/45 text-indigo-200/95",
  Go: "border-cyan-500/35 bg-cyan-950/45 text-cyan-200/95",
  Java: "border-amber-500/35 bg-amber-950/45 text-amber-200/95",
  JavaScript: "border-yellow-500/35 bg-yellow-950/50 text-yellow-200/95",
  Python: "border-emerald-500/35 bg-emerald-950/40 text-emerald-200/95",
  Ruby: "border-rose-500/35 bg-rose-950/45 text-rose-200/95",
  Rust: "border-orange-500/35 bg-orange-950/45 text-orange-200/95",
  TypeScript: "border-sky-500/35 bg-sky-950/45 text-sky-200/95",
};

const FALLBACK =
  "border-slate-600/50 bg-slate-800/80 text-slate-300/90";

export function languageBadgeClass(language: string): string {
  if (Object.prototype.hasOwnProperty.call(LANGUAGE_BADGE, language)) {
    return LANGUAGE_BADGE[language as Language];
  }
  return FALLBACK;
}
