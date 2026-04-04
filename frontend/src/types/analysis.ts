export type Language = "Java" | "JavaScript" | "Python";

export interface AnalyzeRequestBody {
  stackTrace: string;
  code: string;
  language: Language;
}

export interface FixSuggestion {
  description: string;
  confidence: number;
}

export interface AnalysisResult {
  rootCause: string;
  explanation: string;
  fixes: FixSuggestion[];
}

export interface ErrorBody {
  error: string;
}
