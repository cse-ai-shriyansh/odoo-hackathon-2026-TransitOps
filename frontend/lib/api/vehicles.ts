import type { Vehicle } from "@/types/domain";
import { apiRequest } from "./client";

export type VehicleInput = Omit<Vehicle, "id">;

export async function listVehicles(): Promise<Vehicle[]> {
  const response = await apiRequest<Vehicle[]>({ method: "GET", path: "/vehicles" });
  return response.data;
}

export async function createVehicle(input: Partial<VehicleInput>): Promise<Vehicle> {
  const response = await apiRequest<Vehicle, Partial<VehicleInput>>({ method: "POST", path: "/vehicles", body: input });
  return response.data;
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>): Promise<Vehicle> {
  const response = await apiRequest<Vehicle, Partial<VehicleInput>>({ method: "PATCH", path: `/vehicles/${id}`, body: input });
  return response.data;
}

export async function deleteVehicle(id: string): Promise<{ success: true }> {
  const response = await apiRequest<{ success: true }>({ method: "DELETE", path: `/vehicles/${id}` });
  return response.data;
}
