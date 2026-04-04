import { analyzeUrl } from "./client";
import type { AnalysisResult, AnalyzeRequestBody, ErrorBody } from "../types/analysis";

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
    throw new Error(err?.error ?? `Request failed (${res.status})`);
  }

  return data as AnalysisResult;
}
