import type { AnalysisSummary } from "../types/analysis";
import { languageBadgeClass } from "../utils/languageBadge";

interface HistorySidebarProps {
  items: AnalysisSummary[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  deletingId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry: () => void;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function HistorySidebar({
  items,
  loading,
  error,
  selectedId,
  deletingId,
  onSelect,
  onDelete,
  onRetry,
}: HistorySidebarProps) {
  return (
    <aside className="border-t border-slate-800 bg-slate-900/40 xl:w-80 xl:shrink-0 xl:border-l xl:border-t-0">
      <div className="sticky top-0 flex flex-col gap-3 p-4 xl:max-h-screen xl:overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Recent
          </h2>
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="text-xs text-emerald-500/90 hover:text-emerald-400 disabled:opacity-40"
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-400" role="alert">
            {error}
          </p>
        )}

        {loading && items.length === 0 && (
          <p className="text-sm text-slate-500">Loading…</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-slate-500">
            Saved analyses appear here after a successful run (Postgres +
            <code className="mx-1 text-slate-400">persist-results</code>).
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const active = item.id === selectedId;
            const deleting = item.id === deletingId;
            return (
              <li key={item.id}>
                <div
                  className={`group relative rounded-lg border text-left transition ${
                    active
                      ? "border-emerald-600/50 bg-emerald-950/30 ring-1 ring-emerald-600/30"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className="w-full px-3 py-2.5 pr-10 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                      <span className="min-w-0 truncate">
                        {formatWhen(item.createdAt)}
                      </span>
                      <span
                        className={`ml-auto shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${languageBadgeClass(item.language)}`}
                      >
                        {item.language}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-200">
                      {item.rootCauseSummary}
                    </p>
                    {item.stackHeadline && (
                      <p className="mt-1 line-clamp-1 font-mono text-xs text-slate-500">
                        {item.stackHeadline}
                      </p>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    title="Remove from history"
                    aria-label={`Delete analysis from ${formatWhen(item.createdAt)}`}
                    onClick={() => onDelete(item.id)}
                    className="absolute right-1.5 top-1.5 z-10 rounded-md p-1.5 text-slate-500 transition hover:bg-rose-950/55 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:cursor-not-allowed disabled:opacity-40 [@media(hover:hover)]:opacity-60 [@media(hover:hover)]:group-hover:opacity-100"
                  >
                    {deleting ? (
                      <span
                        className="block h-4 w-4 animate-pulse rounded-sm bg-slate-600"
                        aria-hidden
                      />
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
