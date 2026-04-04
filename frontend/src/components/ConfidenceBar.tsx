import { useEffect, useState } from "react";

interface ConfidenceBarProps {
  value: number;
}

function tierStyle(pct: number): {
  fill: string;
  labelColor: string;
  trackRing: string;
} {
  if (pct >= 80) {
    return {
      fill: "bg-gradient-to-r from-emerald-600 to-emerald-400",
      labelColor: "text-emerald-400/95",
      trackRing: "ring-emerald-900/30",
    };
  }
  if (pct >= 60) {
    return {
      fill: "bg-gradient-to-r from-amber-600 to-yellow-400",
      labelColor: "text-amber-400/95",
      trackRing: "ring-amber-900/25",
    };
  }
  return {
    fill: "bg-gradient-to-r from-rose-600 to-rose-400",
    labelColor: "text-rose-400/95",
    trackRing: "ring-rose-900/30",
  };
}

export function ConfidenceBar({ value }: ConfidenceBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const [fillVisible, setFillVisible] = useState(false);
  const styles = tierStyle(pct);

  useEffect(() => {
    setFillVisible(false);
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setFillVisible(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-400">
        Confidence:{" "}
        <span className={`font-semibold tabular-nums ${styles.labelColor}`}>
          {pct}%
        </span>
      </p>
      <div
        className={`h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800/90 ring-1 ring-inset ring-white/[0.06] ${styles.trackRing}`}
      >
        <div
          className={`h-full rounded-full ${styles.fill} transition-[width] duration-700 ease-out motion-reduce:transition-none`}
          style={{ width: fillVisible ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}
