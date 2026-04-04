import type { AnalysisSummary } from "../types/analysis";

interface HistorySidebarProps {
  items: AnalysisSummary[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
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
  onSelect,
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
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-emerald-600/50 bg-emerald-950/30 ring-1 ring-emerald-600/30"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{formatWhen(item.createdAt)}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-medium text-slate-400">
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
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
