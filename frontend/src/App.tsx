import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnalysisRequestError, requestAnalysis } from "./api/analyze";
import {
  deleteAnalysis,
  fetchAnalysisDetail,
  fetchRecentAnalyses,
} from "./api/history";
import { CodeMirrorField } from "./components/CodeMirrorField";
import { ConfidenceBar } from "./components/ConfidenceBar";
import { CopyButton } from "./components/CopyButton";
import {
  HistorySidebar,
  type HistoryLanguageFilter,
} from "./components/HistorySidebar";
import { LANGUAGES } from "./constants/languages";
import type {
  AnalysisResult,
  AnalysisSummary,
  Language,
} from "./types/analysis";

export default function App() {
  const shellRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const [stackTrace, setStackTrace] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("Java");
  const [loading, setLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<{
    message: string;
    suggestedLanguage?: Language;
  } | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [historyItems, setHistoryItems] = useState<AnalysisSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  );
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(
    null,
  );
  const [historyLanguageFilter, setHistoryLanguageFilter] =
    useState<HistoryLanguageFilter>("all");

  const filteredHistoryItems = useMemo(() => {
    if (historyLanguageFilter === "all") return historyItems;
    return historyItems.filter((i) => i.language === historyLanguageFilter);
  }, [historyItems, historyLanguageFilter]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const items = await fetchRecentAnalyses(25);
      setHistoryItems(items);
    } catch (e) {
      setHistoryError(
        e instanceof Error ? e.message : "Could not load recent analyses.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const header = headerRef.current;
    if (!shell || !header) return;
    const sync = () => {
      shell.style.setProperty("--app-header-h", `${header.offsetHeight}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (selectedHistoryId == null) return;
    const stillVisible = filteredHistoryItems.some(
      (i) => i.id === selectedHistoryId,
    );
    if (!stillVisible) setSelectedHistoryId(null);
  }, [selectedHistoryId, filteredHistoryItems]);

  const canSubmit =
    stackTrace.trim().length > 0 && code.trim().length > 0 && !loading;

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      setLoading(true);
      setAnalyzeError(null);
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
        if (err instanceof AnalysisRequestError) {
          const sug = err.suggestedLanguage;
          const lang =
            sug != null && (LANGUAGES as readonly string[]).includes(sug)
              ? (sug as Language)
              : undefined;
          setAnalyzeError({ message: err.message, suggestedLanguage: lang });
        } else {
          setAnalyzeError({
            message:
              err instanceof Error ? err.message : "Something went wrong.",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, stackTrace, code, language, loadHistory],
  );

  const onSelectHistory = useCallback(async (id: string) => {
    setHistoryError(null);
    setSelectedHistoryId(id);
    setAnalyzeError(null);
    try {
      const detail = await fetchAnalysisDetail(id);
      setStackTrace(detail.stackTrace);
      setCode(detail.code);
      setLanguage(detail.language as Language);
      setResult(detail.analysis);
    } catch (e) {
      setHistoryError(
        e instanceof Error ? e.message : "Could not open that analysis.",
      );
      setSelectedHistoryId(null);
    }
  }, []);

  const onDeleteHistory = useCallback(
    async (id: string) => {
      setHistoryError(null);
      setDeletingHistoryId(id);
      try {
        await deleteAnalysis(id);
        setHistoryItems((prev) => prev.filter((x) => x.id !== id));
        if (selectedHistoryId === id) {
          setSelectedHistoryId(null);
          setResult(null);
        }
      } catch (e) {
        setHistoryError(
          e instanceof Error ? e.message : "Could not delete that analysis.",
        );
      } finally {
        setDeletingHistoryId(null);
      }
    },
    [selectedHistoryId],
  );

  return (
    <div
      ref={shellRef}
      className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_120%_50%_at_50%_-5%,rgb(245_158_11_/_0.075),transparent_55%)] bg-fixed text-zinc-100"
    >
      <header
        ref={headerRef}
        className="sticky top-0 z-20 border-b border-zinc-800/50 bg-zinc-950 px-6 py-5 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            AI Debugging Assistant
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
            Paste a stack trace and the related code — get root cause, context,
            and copy-ready fixes.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="min-w-0 px-6 py-10 xl:min-h-0 xl:pl-0 xl:pr-6">
          <form onSubmit={onSubmit} className="space-y-10">
            <section className="space-y-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-6 shadow-panel">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-amber-500/45" aria-hidden />
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Input
                </h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="block min-h-0 space-y-2">
                  <span className="text-sm font-medium text-zinc-400">
                    Stack trace
                  </span>
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
                  <span className="text-sm font-medium text-zinc-400">
                    Code snippet
                  </span>
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
                    onChange={(e) => {
                      setLanguage(e.target.value as Language);
                      setSelectedHistoryId(null);
                    }}
                    className="min-w-[10.5rem] cursor-pointer rounded-xl border border-zinc-700/70 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-200 shadow-sm ring-1 ring-white/[0.03] transition hover:border-zinc-600 hover:bg-zinc-900 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                  className="rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-950/40 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                >
                  {loading ? "Analyzing…" : "Analyze"}
                </button>
              </div>
            </section>

            {analyzeError && (
              <div
                role="alert"
                className="rounded-xl border border-rose-500/20 bg-rose-950/25 px-4 py-3 text-sm text-rose-100/95 ring-1 ring-rose-500/10"
              >
                <p>{analyzeError.message}</p>
                {analyzeError.suggestedLanguage != null && (
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(analyzeError.suggestedLanguage!);
                      setAnalyzeError(null);
                    }}
                    className="mt-3 rounded-lg border border-amber-600/40 bg-amber-950/35 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-500/50 hover:bg-amber-900/40"
                  >
                    Use {analyzeError.suggestedLanguage}
                  </button>
                )}
              </div>
            )}

            {result && (
              <section className="space-y-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/15 p-6 shadow-panel">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-amber-500/45" aria-hidden />
                  <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Analysis
                  </h2>
                </div>

                <article className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
                    Root cause
                  </h3>
                  <p className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/35 via-zinc-900/40 to-zinc-950/60 px-6 py-5 text-lg font-medium leading-snug tracking-tight text-amber-50 shadow-[inset_0_1px_0_0_rgb(251_191_36_/_0.08)] ring-1 ring-amber-500/10 md:text-xl md:leading-snug">
                    {result.rootCause}
                  </p>
                </article>

                <article className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
                    Explanation
                  </h3>
                  <p className="whitespace-pre-wrap rounded-xl border border-zinc-800/60 bg-zinc-900/35 px-4 py-3.5 text-[15px] leading-relaxed text-zinc-300 ring-1 ring-white/[0.03]">
                    {result.explanation}
                  </p>
                </article>

                <article className="space-y-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
                    Suggested fixes
                  </h3>
                  <ul className="flex flex-col gap-6">
                    {result.fixes.map((fix, i) => (
                      <li
                        key={i}
                        className="rounded-2xl border border-zinc-700/55 bg-zinc-900/35 p-5 shadow-md ring-1 ring-white/[0.04] md:p-6"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-200/85">
                            Fix #{i + 1}
                          </span>
                          <CopyButton text={fix.description} />
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-200">
                          {fix.description}
                        </p>
                        <div className="mt-5">
                          <ConfidenceBar value={fix.confidence} />
                        </div>
                        {fix.suggestedCode != null &&
                          fix.suggestedCode.trim() !== "" && (
                            <div className="mt-5 space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500/90">
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
                                variant="embedded"
                                height={`${Math.min(
                                  320,
                                  Math.max(
                                    96,
                                    20 +
                                      fix.suggestedCode.split("\n").length * 18,
                                  ),
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
          items={filteredHistoryItems}
          unfilteredTotal={historyItems.length}
          languageFilter={historyLanguageFilter}
          onLanguageFilterChange={setHistoryLanguageFilter}
          loading={historyLoading}
          error={historyError}
          selectedId={selectedHistoryId}
          deletingId={deletingHistoryId}
          onSelect={onSelectHistory}
          onDelete={onDeleteHistory}
          onRetry={loadHistory}
        />
      </div>
    </div>
  );
}
