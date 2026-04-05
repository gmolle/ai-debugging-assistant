export type Language =
  | "C#"
  | "C++"
  | "Go"
  | "Java"
  | "JavaScript"
  | "Kotlin"
  | "PHP"
  | "Python"
  | "Ruby"
  | "Rust"
  | "Swift"
  | "TypeScript";

/** Sidebar filter: all languages or one specific language. */
export type HistoryLanguageFilter = "all" | Language;

export interface AnalyzeRequestBody {
  stackTrace: string;
  code: string;
  language: Language;
}

export interface FixSuggestion {
  description: string;
  /** Concrete code in the analyzed language; may be missing on older saved analyses. */
  suggestedCode?: string;
  confidence: number;
}

export interface AnalysisResult {
  rootCause: string;
  explanation: string;
  fixes: FixSuggestion[];
}

export interface ErrorBody {
  error: string;
  suggestedLanguage?: string | null;
}

export interface AnalysisSummary {
  id: string;
  createdAt: string;
  language: string;
  rootCauseSummary: string;
  stackHeadline: string;
}

export interface AnalysisDetail {
  id: string;
  createdAt: string;
  language: string;
  stackTrace: string;
  code: string;
  analysis: AnalysisResult;
}
