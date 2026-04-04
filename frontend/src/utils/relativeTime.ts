/** Full local date/time for tooltips and screen readers. */
export function formatExactDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Short relative label, e.g. "2 hours ago". */
export function formatRelativeTime(iso: string, nowMs = Date.now()): string {
  try {
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return iso;
    const diffSec = Math.round((t - nowMs) / 1000);
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

    const absSec = Math.abs(diffSec);
    if (absSec < 60) return rtf.format(diffSec, "second");

    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");

    const diffHr = Math.round(diffMin / 60);
    if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");

    const diffDay = Math.round(diffHr / 24);
    if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");

    const diffMonth = Math.round(diffDay / 30);
    if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");

    const diffYear = Math.round(diffDay / 365);
    return rtf.format(diffYear, "year");
  } catch {
    return iso;
  }
}
