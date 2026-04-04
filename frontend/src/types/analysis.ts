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
