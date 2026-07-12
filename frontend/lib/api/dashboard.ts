import type { DashboardPayload } from "@/types/domain";
import { apiRequest } from "./client";

export async function getDashboard(): Promise<DashboardPayload> {
  const response = await apiRequest<DashboardPayload>({ method: "GET", path: "/dashboard" });
  return response.data;
}
