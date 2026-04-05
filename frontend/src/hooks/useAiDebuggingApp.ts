import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnalysisRequestError, requestAnalysis } from "../api/analyze";
import {
  deleteAnalysis,
  fetchAnalysisDetail,
  fetchRecentAnalyses,
} from "../api/history";
import { LANGUAGES } from "../constants/languages";
import type {
  AnalysisResult,
  AnalysisSummary,
  HistoryLanguageFilter,
  Language,
} from "../types/analysis";

export function useAiDebuggingApp() {
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

  const onNewAnalysis = useCallback(() => {
    setStackTrace("");
    setCode("");
    setResult(null);
    setAnalyzeError(null);
    setSelectedHistoryId(null);
  }, []);

  const hasInputToReset = useMemo(
    () =>
      stackTrace.trim() !== "" ||
      code.trim() !== "" ||
      result !== null ||
      selectedHistoryId !== null ||
      analyzeError !== null,
    [stackTrace, code, result, selectedHistoryId, analyzeError],
  );

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

  const onStackTraceChange = useCallback((value: string) => {
    setStackTrace(value);
    setSelectedHistoryId(null);
  }, []);

  const onCodeChange = useCallback((value: string) => {
    setCode(value);
    setSelectedHistoryId(null);
  }, []);

  const onLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setSelectedHistoryId(null);
  }, []);

  const onUseSuggestedLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    setAnalyzeError(null);
  }, []);

  const liveRegionMessage = loading
    ? "Analyzing stack trace and code. This may take a little while."
    : "";

  const inputSectionProps = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  const historySidebarProps = useMemo(
    () => ({
      items: filteredHistoryItems,
      unfilteredTotal: historyItems.length,
      languageFilter: historyLanguageFilter,
      onLanguageFilterChange: setHistoryLanguageFilter,
      loading: historyLoading,
      error: historyError,
      selectedId: selectedHistoryId,
      deletingId: deletingHistoryId,
      onSelect: onSelectHistory,
      onDelete: onDeleteHistory,
      onRetry: loadHistory,
    }),
    [
      filteredHistoryItems,
      historyItems.length,
      historyLanguageFilter,
      historyLoading,
      historyError,
      selectedHistoryId,
      deletingHistoryId,
      onSelectHistory,
      onDeleteHistory,
      loadHistory,
    ],
  );

  return {
    shellRef,
    headerRef,
    liveRegionMessage,
    onSubmit,
    inputSectionProps,
    analyzeError,
    onUseSuggestedLanguage,
    result,
    language,
    historySidebarProps,
  };
}
