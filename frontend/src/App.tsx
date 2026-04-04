import { useCallback, useEffect, useState, type FormEvent } from "react";
import { requestAnalysis } from "./api/analyze";
import { apiBase } from "./api/client";
import { fetchAnalysisDetail, fetchRecentAnalyses } from "./api/history";
import { CodeMirrorField } from "./components/CodeMirrorField";
import { ConfidenceBar } from "./components/ConfidenceBar";
import { CopyButton } from "./components/CopyButton";
import { HistorySidebar } from "./components/HistorySidebar";
import type { AnalysisResult, AnalysisSummary, Language } from "./types/analysis";

const LANGUAGES: Language[] = ["Java", "JavaScript", "Python"];

export default function App() {
  const [stackTrace, setStackTrace] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("Java");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [historyItems, setHistoryItems] = useState<AnalysisSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null
  );

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const items = await fetchRecentAnalyses(25);
      setHistoryItems(items);
    } catch (e) {
      setHistoryError(
        e instanceof Error ? e.message : "Could not load recent analyses."
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const canSubmit =
    stackTrace.trim().length > 0 && code.trim().length > 0 && !loading;

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      setLoading(true);
      setError(null);
      setResult(null);
      setSelectedHistoryId(null);

      try {
        const data = await requestAnalysis({
          stackTrace: stackTrace.trim(),
          code: code.trim(),
          language,
        });
        setResult(data);
        await loadHistory();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, stackTrace, code, language, loadHistory]
  );

  const onSelectHistory = useCallback(async (id: string) => {
    setHistoryError(null);
    setSelectedHistoryId(id);
    setError(null);
    try {
      const detail = await fetchAnalysisDetail(id);
      setStackTrace(detail.stackTrace);
      setCode(detail.code);
      setLanguage(detail.language as Language);
      setResult(detail.analysis);
    } catch (e) {
      setHistoryError(
        e instanceof Error ? e.message : "Could not open that analysis."
      );
      setSelectedHistoryId(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            AI Debugging Assistant
          </h1>
          <p className="text-xs text-slate-500">
            API:{" "}
            <code className="rounded bg-slate-900 px-1.5 py-0.5 text-slate-400">
              {apiBase ||
                (import.meta.env.DEV
                  ? "same origin /api → localhost:8080"
                  : "http://localhost:8080")}
            </code>
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col xl:flex-row">
        <main className="min-w-0 flex-1 px-6 py-8">
          <form onSubmit={onSubmit} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Input
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="block min-h-0 space-y-2">
                  <span className="text-sm text-slate-300">Stack trace</span>
                  <CodeMirrorField
                    mode="plaintext"
                    value={stackTrace}
                    height="280px"
                    placeholderText="Paste the exception and stack frames…"
                    onChange={(v) => {
                      setStackTrace(v);
                      setSelectedHistoryId(null);
                    }}
                  />
                </label>
                <label className="block min-h-0 space-y-2">
                  <span className="text-sm text-slate-300">Code snippet</span>
                  <CodeMirrorField
                    mode="code"
                    language={language}
                    value={code}
                    height="280px"
                    placeholderText="Paste the relevant code…"
                    onChange={(v) => {
                      setCode(v);
                      setSelectedHistoryId(null);
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Language</span>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value as Language);
                      setSelectedHistoryId(null);
                    }}
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
                        {fix.suggestedCode != null &&
                          fix.suggestedCode.trim() !== "" && (
                            <div className="mt-4 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Suggested code
                                </h4>
                                <CopyButton
                                  text={fix.suggestedCode}
                                  label="Copy code"
                                />
                              </div>
                              <CodeMirrorField
                                mode="code"
                                language={language}
                                value={fix.suggestedCode}
                                readOnly
                                height={`${Math.min(
                                  320,
                                  Math.max(
                                    96,
                                    20 +
                                      fix.suggestedCode.split("\n").length * 18
                                  )
                                )}px`}
                              />
                            </div>
                          )}
                      </li>
                    ))}
                  </ul>
                </article>
              </section>
            )}
          </form>
        </main>

        <HistorySidebar
          items={historyItems}
          loading={historyLoading}
          error={historyError}
          selectedId={selectedHistoryId}
          onSelect={onSelectHistory}
          onRetry={loadHistory}
        />
      </div>
    </div>
  );
}
