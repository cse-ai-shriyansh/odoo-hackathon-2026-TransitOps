import type { FuelLog } from "@/types/domain";
import { apiRequest } from "./client";

export type FuelInput = Omit<FuelLog, "id" | "totalCost">;

export async function listFuelLogs(): Promise<FuelLog[]> {
  const response = await apiRequest<FuelLog[]>({ method: "GET", path: "/fuel" });
  return response.data;
}

export async function createFuelLog(input: Partial<FuelInput>): Promise<FuelLog> {
  const response = await apiRequest<FuelLog, Partial<FuelInput>>({ method: "POST", path: "/fuel", body: input });
  return response.data;
}

export async function updateFuelLog(id: string, input: Partial<FuelInput>): Promise<FuelLog> {
  const response = await apiRequest<FuelLog, Partial<FuelInput>>({ method: "PATCH", path: `/fuel/${id}`, body: input });
  return response.data;
}

export async function deleteFuelLog(id: string): Promise<{ success: true }> {
  const response = await apiRequest<{ success: true }>({ method: "DELETE", path: `/fuel/${id}` });
  return response.data;
}
