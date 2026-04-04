import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { cpp } from "@codemirror/lang-cpp";
import { go } from "@codemirror/lang-go";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { StreamLanguage } from "@codemirror/language";
import { csharp, kotlin } from "@codemirror/legacy-modes/mode/clike";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { indentWithTab } from "@codemirror/commands";
import type { Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, placeholder } from "@codemirror/view";
import { useMemo } from "react";
import type { Language } from "../types/analysis";

function languageExtension(lang: Language): Extension {
  switch (lang) {
    case "C#":
      return StreamLanguage.define(csharp);
    case "C++":
      return cpp();
    case "Go":
      return go();
    case "Java":
      return java();
    case "JavaScript":
      return javascript({ jsx: true, typescript: false });
    case "Kotlin":
      return StreamLanguage.define(kotlin);
    case "PHP":
      return php({ plain: true });
    case "Python":
      return python();
    case "Ruby":
      return StreamLanguage.define(ruby);
    case "Rust":
      return rust();
    case "Swift":
      return StreamLanguage.define(swift);
    case "TypeScript":
      return javascript({ jsx: true, typescript: true });
  }
}

export interface CodeMirrorFieldProps {
  value: string;
  onChange?: (value: string) => void;
  placeholderText?: string;
  mode: "code" | "plaintext";
  language?: Language;
  readOnly?: boolean;
  height: string;
  lineNumbers?: boolean;
  /** Darker inset style for code inside analysis cards */
  variant?: "default" | "embedded";
  className?: string;
}

export function CodeMirrorField({
  value,
  onChange,
  placeholderText = "",
  mode,
  language = "Java",
  readOnly = false,
  height,
  lineNumbers: showLineNumbers = true,
  variant = "default",
  className = "",
}: CodeMirrorFieldProps) {
  const extensions = useMemo(() => {
    const ext: Extension[] = [
      keymap.of([indentWithTab]),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ spellcheck: "false" }),
    ];
    if (showLineNumbers) {
      ext.push(lineNumbers());
    }
    if (!readOnly && placeholderText) {
      ext.push(placeholder(placeholderText));
    }
    if (mode === "code") {
      ext.push(languageExtension(language));
    }
    return ext;
  }, [mode, language, placeholderText, readOnly, showLineNumbers]);

  const shell =
    variant === "embedded"
      ? "cursor-text overflow-hidden rounded-lg border border-zinc-800/90 bg-[#121110] shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.04)] ring-1 ring-zinc-950/80 transition-[box-shadow,border-color] focus-within:border-amber-500/35 focus-within:ring-amber-500/10"
      : "cursor-text overflow-hidden rounded-xl border border-zinc-700/70 bg-[#1c1b1a] shadow-panel-inset ring-1 ring-white/[0.04] transition-[box-shadow,border-color] focus-within:border-amber-500/40 focus-within:ring-amber-500/12";

  return (
    <div className={`${shell} ${className}`}>
      <CodeMirror
        value={value}
        height={height}
        theme={vscodeDark}
        extensions={extensions}
        editable={!readOnly}
        onChange={readOnly ? undefined : onChange}
        className="text-[13px] [&_.cm-editor]:outline-none [&_.cm-scroller]:font-mono [&_.cm-scroller]:leading-relaxed"
        basicSetup={false}
      />
    </div>
  );
}
