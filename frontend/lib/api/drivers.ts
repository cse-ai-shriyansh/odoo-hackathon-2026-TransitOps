import type { Driver } from "@/types/domain";
import { apiRequest } from "./client";

export type DriverInput = Omit<Driver, "id">;

export async function listDrivers(): Promise<Driver[]> {
  const response = await apiRequest<Driver[]>({ method: "GET", path: "/drivers" });
  return response.data;
}

export async function createDriver(input: Partial<DriverInput>): Promise<Driver> {
  const response = await apiRequest<Driver, Partial<DriverInput>>({ method: "POST", path: "/drivers", body: input });
  return response.data;
}

export async function updateDriver(id: string, input: Partial<DriverInput>): Promise<Driver> {
  const response = await apiRequest<Driver, Partial<DriverInput>>({ method: "PATCH", path: `/drivers/${id}`, body: input });
  return response.data;
}

export async function deleteDriver(id: string): Promise<{ success: true }> {
  const response = await apiRequest<{ success: true }>({ method: "DELETE", path: `/drivers/${id}` });
  return response.data;
}
