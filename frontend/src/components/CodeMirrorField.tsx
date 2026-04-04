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

  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-700 bg-[#1e1e1e] focus-within:border-emerald-600/60 focus-within:ring-1 focus-within:ring-emerald-600/40 ${className} cursor-text`}
    >
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
