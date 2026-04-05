import { CodeMirrorField } from "./CodeMirrorField";
import { Spinner } from "./Spinner";
import { LANGUAGES } from "../constants/languages";
import type { Language } from "../types/analysis";

export interface AnalyzeInputSectionProps {
  loading: boolean;
  canSubmit: boolean;
  hasInputToReset: boolean;
  stackTrace: string;
  code: string;
  language: Language;
  onStackTraceChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onLanguageChange: (language: Language) => void;
  onNewAnalysis: () => void;
}

export function AnalyzeInputSection({
  loading,
  canSubmit,
  hasInputToReset,
  stackTrace,
  code,
  language,
  onStackTraceChange,
  onCodeChange,
  onLanguageChange,
  onNewAnalysis,
}: AnalyzeInputSectionProps) {
  return (
    <section
      className="space-y-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-6 shadow-panel"
      aria-busy={loading}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-amber-500/45" aria-hidden />
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Input
          </h2>
        </div>
        <button
          type="button"
          onClick={onNewAnalysis}
          disabled={!hasInputToReset || loading}
          className="rounded-xl border border-zinc-600/70 bg-zinc-900/50 px-3.5 py-2 text-xs font-semibold text-zinc-300 shadow-sm ring-1 ring-white/[0.04] transition hover:border-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-35"
        >
          New analysis
        </button>
      </div>
      <div className="relative min-h-[280px]">
        {loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-zinc-950/55 backdrop-blur-[2px] lg:rounded-2xl"
            aria-hidden
          >
            <div className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-amber-500/25 bg-zinc-900/95 px-7 py-6 text-center shadow-2xl shadow-amber-950/20 ring-1 ring-amber-500/10 sm:px-8 sm:py-7">
              <Spinner size="md" />
              <p className="text-sm font-semibold text-zinc-100">Analyzing…</p>
              <p className="text-xs leading-relaxed text-zinc-500">
                Waiting on the model. On a cold API this can take 30s or more.
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="block min-h-0 space-y-2">
            <span className="text-sm font-medium text-zinc-400">
              Stack trace
            </span>
            <CodeMirrorField
              mode="plaintext"
              plaintextTone="stackTrace"
              value={stackTrace}
              height="280px"
              readOnly={loading}
              placeholderText="Paste the exception and stack frames…"
              onChange={onStackTraceChange}
            />
          </label>
          <label className="block min-h-0 space-y-2">
            <span className="text-sm font-medium text-zinc-400">
              Code snippet
            </span>
            <CodeMirrorField
              mode="code"
              language={language}
              value={code}
              height="280px"
              readOnly={loading}
              placeholderText="Paste the relevant code…"
              onChange={onCodeChange}
            />
          </label>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 border-t border-zinc-800/50 pt-5">
        <label
          htmlFor="analysis-language"
          className="block min-w-0 space-y-2"
        >
          <span className="block text-sm font-medium text-zinc-400">
            Language
          </span>
          <select
            id="analysis-language"
            value={language}
            disabled={loading}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="min-w-[10.5rem] cursor-pointer rounded-xl border border-zinc-700/70 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-200 shadow-sm ring-1 ring-white/[0.03] transition hover:border-zinc-600 hover:bg-zinc-900 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-950/40 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="!text-zinc-950" />
              <span>Analyzing…</span>
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </div>
    </section>
  );
}
