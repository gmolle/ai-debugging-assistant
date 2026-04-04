import { apiUrl } from "./client";
import type { AnalysisDetail, AnalysisSummary } from "../types/analysis";

export async function fetchRecentAnalyses(
  limit = 20
): Promise<AnalysisSummary[]> {
  const res = await fetch(
    `${apiUrl("/analyses/recent")}?limit=${encodeURIComponent(String(limit))}`
  );
  if (!res.ok) {
    throw new Error(`Failed to load history (${res.status})`);
  }
  return res.json() as Promise<AnalysisSummary[]>;
}

export async function fetchAnalysisDetail(id: string): Promise<AnalysisDetail> {
  const res = await fetch(`${apiUrl("/analyses/")}${encodeURIComponent(id)}`);
  if (res.status === 404) {
    throw new Error("That analysis is no longer available.");
  }
  if (!res.ok) {
    throw new Error(`Failed to load analysis (${res.status})`);
  }
  return res.json() as Promise<AnalysisDetail>;
}
