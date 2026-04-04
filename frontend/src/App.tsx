import { useCallback, useState, type FormEvent } from "react";
import { requestAnalysis } from "./api/analyze";
import { ConfidenceBar } from "./components/ConfidenceBar";
import { CopyButton } from "./components/CopyButton";
import type { AnalysisResult, Language } from "./types/analysis";

const LANGUAGES: Language[] = ["Java", "JavaScript", "Python"];

export default function App() {
  const [stackTrace, setStackTrace] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("Java");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const canSubmit =
    stackTrace.trim().length > 0 && code.trim().length > 0 && !loading;

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const data = await requestAnalysis({
          stackTrace: stackTrace.trim(),
          code: code.trim(),
          language,
        });
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, stackTrace, code, language]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            AI Debugging Assistant
          </h1>
          <p className="text-xs text-slate-500">
            API:{" "}
            <code className="rounded bg-slate-900 px-1.5 py-0.5 text-slate-400">
              {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}
            </code>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <form onSubmit={onSubmit} className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Input
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Stack trace</span>
                <textarea
                  value={stackTrace}
                  onChange={(e) => setStackTrace(e.target.value)}
                  rows={10}
                  placeholder="Paste the exception and stack frames…"
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-emerald-600/60 focus:outline-none focus:ring-1 focus:ring-emerald-600/40"
                  spellCheck={false}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Code snippet</span>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={10}
                  placeholder="Paste the relevant code…"
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-emerald-600/60 focus:outline-none focus:ring-1 focus:ring-emerald-600/40"
                  spellCheck={false}
                />
              </label>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="block space-y-2">
                <span className="text-sm text-slate-300">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-emerald-600/60 focus:outline-none focus:ring-1 focus:ring-emerald-600/40"
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
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Analyzing…" : "Analyze"}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Both fields are required. Set{" "}
              <code className="text-slate-400">OPENAI_API_KEY</code> on the
              backend for live analysis.
            </p>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
            >
              {error}
            </div>
          )}

          {result && (
            <section className="space-y-8 border-t border-slate-800 pt-8">
              <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Analysis
              </h2>

              <article className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-500/90">
                  Root cause
                </h3>
                <p className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-200">
                  {result.rootCause}
                </p>
              </article>

              <article className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-500/90">
                  Explanation
                </h3>
                <p className="whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-300 leading-relaxed">
                  {result.explanation}
                </p>
              </article>

              <article className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-500/90">
                  Suggested fixes
                </h3>
                <ul className="space-y-4">
                  {result.fixes.map((fix, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="flex-1 text-sm text-slate-200 leading-relaxed">
                          {fix.description}
                        </p>
                        <CopyButton text={fix.description} />
                      </div>
                      <div className="mt-3">
                        <ConfidenceBar value={fix.confidence} />
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          )}
        </form>
      </main>
    </div>
  );
}
