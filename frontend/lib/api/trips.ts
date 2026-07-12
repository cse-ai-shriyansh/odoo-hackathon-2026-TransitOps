import type { Trip } from "@/types/domain";
import { apiRequest } from "./client";

export type TripInput = Omit<Trip, "id">;

export async function listTrips(): Promise<Trip[]> {
  const response = await apiRequest<Trip[]>({ method: "GET", path: "/trips" });
  return response.data;
}

export async function createTrip(input: Partial<TripInput>): Promise<Trip> {
  const response = await apiRequest<Trip, Partial<TripInput>>({ method: "POST", path: "/trips", body: input });
  return response.data;
}

export async function updateTrip(id: string, input: Partial<TripInput>): Promise<Trip> {
  const response = await apiRequest<Trip, Partial<TripInput>>({ method: "PATCH", path: `/trips/${id}`, body: input });
  return response.data;
}

export async function deleteTrip(id: string): Promise<{ success: true }> {
  const response = await apiRequest<{ success: true }>({ method: "DELETE", path: `/trips/${id}` });
  return response.data;
}
