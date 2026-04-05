import { useEffect, useState } from "react";
import type {
  AnalysisSummary,
  HistoryLanguageFilter,
  Language,
} from "../types/analysis";
import { LANGUAGES } from "../constants/languages";
import { languageBadgeClass } from "../utils/languageBadge";
import {
  formatExactDateTime,
  formatRelativeTime,
} from "../utils/relativeTime";
import { Spinner } from "./Spinner";

export type { HistoryLanguageFilter };

interface HistorySidebarProps {
  items: AnalysisSummary[];
  /** Total count before language filter (for empty states). */
  unfilteredTotal: number;
  languageFilter: HistoryLanguageFilter;
  onLanguageFilterChange: (value: HistoryLanguageFilter) => void;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  deletingId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry: () => void;
}

export function HistorySidebar({
  items,
  unfilteredTotal,
  languageFilter,
  onLanguageFilterChange,
  loading,
  error,
  selectedId,
  deletingId,
  onSelect,
  onDelete,
  onRetry,
}: HistorySidebarProps) {
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const filteredEmpty =
    !loading &&
    !error &&
    items.length === 0 &&
    unfilteredTotal > 0 &&
    languageFilter !== "all";

  return (
    <aside className="border-t border-zinc-800/60 bg-zinc-950/30 px-6 pb-10 pt-8 xl:sticky xl:top-[var(--app-header-h)] xl:z-10 xl:flex xl:h-[calc(100dvh-var(--app-header-h))] xl:w-full xl:flex-col xl:overflow-hidden xl:self-start xl:border-x xl:border-t-0 xl:border-zinc-800/60 xl:px-0 xl:pb-0 xl:pt-0">
      <div className="shrink-0 space-y-4 border-b border-zinc-800/50 bg-zinc-950/95 px-5 pb-4 pt-5 backdrop-blur-md xl:bg-zinc-950/90">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-amber-500/40" aria-hidden />
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Recent
            </h2>
          </div>
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="rounded-lg px-2 py-1 text-xs font-medium text-amber-400/90 transition hover:bg-amber-950/40 hover:text-amber-200 disabled:opacity-40"
          >
            Refresh
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Language
          </span>
          <select
            value={languageFilter}
            onChange={(e) => {
              const v = e.target.value;
              onLanguageFilterChange(v === "all" ? "all" : (v as Language));
            }}
            className="w-full cursor-pointer rounded-lg border border-zinc-700/70 bg-zinc-900/60 px-2.5 py-2 text-xs text-zinc-200 shadow-sm ring-1 ring-white/[0.03] transition hover:border-zinc-600 hover:bg-zinc-900 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            aria-label="Filter history by language"
          >
            <option value="all">All languages</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5 pt-4">
        {error && (
          <p className="text-xs text-rose-400" role="alert">
            {error}
          </p>
        )}

        {loading && unfilteredTotal === 0 && (
          <div className="flex items-center gap-2.5 text-sm text-zinc-500">
            <Spinner size="sm" className="text-amber-500/80" />
            <span>Loading history…</span>
          </div>
        )}

        {!loading && !error && unfilteredTotal === 0 && (
          <p className="text-sm text-zinc-500">
            Saved analyses appear here after a successful run (Postgres +
            <code className="mx-1 text-zinc-400">persist-results</code>).
          </p>
        )}

        {filteredEmpty && (
          <p className="text-sm text-zinc-500">
            No saved analyses for{" "}
            <span className="font-medium text-zinc-400">{languageFilter}</span>.
            Choose <span className="text-zinc-400">All languages</span> to see
            everything.
          </p>
        )}

        <ul className="flex flex-col gap-2.5">
          {items.map((item) => {
            const active = item.id === selectedId;
            const deleting = item.id === deletingId;
            return (
              <li key={item.id}>
                <div
                  className={`group relative rounded-xl border text-left shadow-sm transition ${
                    deleting
                      ? "border-zinc-700/50 bg-zinc-900/25 opacity-70"
                      : ""
                  } ${
                    active
                      ? "border-amber-500/40 bg-amber-950/20 ring-1 ring-amber-500/15"
                      : "border-zinc-800/70 bg-zinc-900/40 ring-1 ring-white/[0.03] hover:border-zinc-700/80 hover:bg-zinc-900/55"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    disabled={deleting}
                    className="w-full px-3 py-2.5 pr-10 text-left disabled:cursor-not-allowed"
                  >
                    <div className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
                      <time
                        dateTime={item.createdAt}
                        title={formatExactDateTime(item.createdAt)}
                        className="min-w-0 cursor-help truncate border-b border-dotted border-zinc-600/70 underline-offset-2"
                      >
                        {formatRelativeTime(item.createdAt, nowTick)}
                      </time>
                      <span
                        className={`ml-auto shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${languageBadgeClass(item.language)}`}
                      >
                        {item.language}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-zinc-200">
                      {item.rootCauseSummary}
                    </p>
                    {item.stackHeadline && (
                      <p className="mt-1 line-clamp-1 font-mono text-xs text-zinc-500">
                        {item.stackHeadline}
                      </p>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    title={deleting ? "Deleting…" : "Remove from history"}
                    aria-busy={deleting}
                    aria-label={
                      deleting
                        ? "Deleting analysis…"
                        : `Delete analysis from ${formatExactDateTime(item.createdAt)}`
                    }
                    onClick={() => onDelete(item.id)}
                    className="absolute right-1.5 top-1.5 z-10 rounded-md p-1.5 text-zinc-500 transition hover:bg-rose-950/55 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:cursor-not-allowed disabled:opacity-100 [@media(hover:hover)]:opacity-60 [@media(hover:hover)]:group-hover:opacity-100"
                  >
                    {deleting ? (
                      <Spinner size="sm" className="text-amber-400" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
