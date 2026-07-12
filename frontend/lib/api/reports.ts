import { apiRequest } from "./client";

export interface ReportPayload {
  generatedAt: string;
  summary: unknown;
}

export async function getReports(): Promise<ReportPayload> {
  const response = await apiRequest<ReportPayload>({ method: "GET", path: "/reports" });
  return response.data;
}
