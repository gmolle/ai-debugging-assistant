import type { Language } from "../types/analysis";

export interface AnalyzeErrorBannerProps {
  message: string;
  suggestedLanguage?: Language;
  onUseSuggestedLanguage: (language: Language) => void;
}

export function AnalyzeErrorBanner({
  message,
  suggestedLanguage,
  onUseSuggestedLanguage,
}: AnalyzeErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-500/20 bg-rose-950/25 px-4 py-3 text-sm text-rose-100/95 ring-1 ring-rose-500/10"
    >
      <p>{message}</p>
      {suggestedLanguage != null && (
        <button
          type="button"
          onClick={() => onUseSuggestedLanguage(suggestedLanguage)}
          className="mt-3 rounded-lg border border-amber-600/40 bg-amber-950/35 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-500/50 hover:bg-amber-900/40"
        >
          Use {suggestedLanguage}
        </button>
      )}
    </div>
  );
}
