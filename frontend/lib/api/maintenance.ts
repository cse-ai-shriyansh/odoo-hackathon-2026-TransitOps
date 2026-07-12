import type { MaintenanceRecord } from "@/types/domain";
import { apiRequest } from "./client";

export type MaintenanceInput = Omit<MaintenanceRecord, "id">;

export async function listMaintenance(): Promise<MaintenanceRecord[]> {
  const response = await apiRequest<MaintenanceRecord[]>({ method: "GET", path: "/maintenance" });
  return response.data;
}

export async function createMaintenance(input: Partial<MaintenanceInput>): Promise<MaintenanceRecord> {
  const response = await apiRequest<MaintenanceRecord, Partial<MaintenanceInput>>({
    method: "POST",
    path: "/maintenance",
    body: input
  });
  return response.data;
}

export async function updateMaintenance(id: string, input: Partial<MaintenanceInput>): Promise<MaintenanceRecord> {
  const response = await apiRequest<MaintenanceRecord, Partial<MaintenanceInput>>({
    method: "PATCH",
    path: `/maintenance/${id}`,
    body: input
  });
  return response.data;
}

export async function deleteMaintenance(id: string): Promise<{ success: true }> {
  const response = await apiRequest<{ success: true }>({ method: "DELETE", path: `/maintenance/${id}` });
  return response.data;
}
