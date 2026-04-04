import { analyzeUrl } from "./client";
import type { AnalysisResult, AnalyzeRequestBody, ErrorBody } from "../types/analysis";

export class AnalysisRequestError extends Error {
  readonly suggestedLanguage?: string;

  constructor(message: string, options?: { suggestedLanguage?: string }) {
    super(message);
    this.name = "AnalysisRequestError";
    this.suggestedLanguage = options?.suggestedLanguage;
  }
}

export async function requestAnalysis(
  body: AnalyzeRequestBody
): Promise<AnalysisResult> {
  const res = await fetch(analyzeUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("The server returned invalid JSON.");
  }

  if (!res.ok) {
    const err = data as ErrorBody | null;
    const msg = err?.error ?? `Request failed (${res.status})`;
    const sug = err?.suggestedLanguage;
    throw new AnalysisRequestError(msg, {
      suggestedLanguage:
        typeof sug === "string" && sug.length > 0 ? sug : undefined,
    });
  }

  return data as AnalysisResult;
}
