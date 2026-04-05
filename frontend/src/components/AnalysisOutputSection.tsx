import { CodeMirrorField } from "./CodeMirrorField";
import { ConfidenceBar } from "./ConfidenceBar";
import { CopyButton } from "./CopyButton";
import type { AnalysisResult, FixSuggestion, Language } from "../types/analysis";

function suggestedCodeHeight(suggestedCode: string): string {
  const px = Math.min(
    320,
    Math.max(96, 20 + suggestedCode.split("\n").length * 18),
  );
  return `${px}px`;
}

function FixListItem({
  fix,
  index,
  language,
}: {
  fix: FixSuggestion;
  index: number;
  language: Language;
}) {
  return (
    <li className="rounded-2xl border border-zinc-700/55 bg-zinc-900/35 p-5 shadow-md ring-1 ring-white/[0.04] md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-200/85">
          Fix #{index + 1}
        </span>
        <CopyButton text={fix.description} />
      </div>
      <p className="text-sm leading-relaxed text-zinc-200">{fix.description}</p>
      <div className="mt-5">
        <ConfidenceBar value={fix.confidence} />
      </div>
      {fix.suggestedCode != null && fix.suggestedCode.trim() !== "" && (
        <div className="mt-5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500/90">
              Suggested code
            </h4>
            <CopyButton text={fix.suggestedCode} label="Copy code" />
          </div>
          <CodeMirrorField
            mode="code"
            language={language}
            value={fix.suggestedCode}
            readOnly
            variant="embedded"
            height={suggestedCodeHeight(fix.suggestedCode)}
          />
        </div>
      )}
    </li>
  );
}

export interface AnalysisOutputSectionProps {
  result: AnalysisResult;
  language: Language;
}

export function AnalysisOutputSection({
  result,
  language,
}: AnalysisOutputSectionProps) {
  return (
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
            <FixListItem
              key={i}
              fix={fix}
              index={i}
              language={language}
            />
          ))}
        </ul>
      </article>
    </section>
  );
}
