import { useCallback, useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className="shrink-0 rounded-lg border border-zinc-600/50 bg-zinc-800/50 px-2.5 py-1 text-xs font-medium text-zinc-200 shadow-sm transition hover:border-zinc-500/60 hover:bg-zinc-700/55 focus:outline-none focus:ring-2 focus:ring-amber-500/35"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
