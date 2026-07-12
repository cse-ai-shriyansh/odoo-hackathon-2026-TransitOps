import type { Vehicle } from "@/types/domain";
import { conflict, forbidden, notFound, validationError } from "../errors";
import { repositories } from "../repositories";
import { vehicleCreateSchema } from "../validation";
import type { UserRole } from "@/types/domain";

const allowedWriteRoles: UserRole[] = ["admin", "fleet_manager"];

function requireAllowed(role: UserRole): void {
  if (!allowedWriteRoles.includes(role)) {
    throw forbidden("Insufficient permissions");
  }
}

function ensureUniquePlate(plateNumber: string, excludeId?: string): void {
  const duplicate = repositories.listVehicles().find((vehicle) => vehicle.plateNumber === plateNumber && vehicle.id !== excludeId);

  if (duplicate) {
    throw conflict("Vehicle registration number must be unique.", { plateNumber: "Registration number already exists." });
  }
}

export function listVehiclesService(role: UserRole): Vehicle[] {
  requireAllowed(role);
  return repositories.listVehicles();
}

export function createVehicleService(role: UserRole, body: unknown): Vehicle {
  requireAllowed(role);
  const parsed = vehicleCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  ensureUniquePlate(parsed.data.plateNumber);

  const records = repositories.listVehicles();
  const record: Vehicle = {
    ...parsed.data,
    driverId: parsed.data.driverId ?? null,
    id: crypto.randomUUID()
  };
  records.unshift(record);
  repositories.saveVehicles(records);
  return record;
}

export function updateVehicleService(role: UserRole, id: string, body: unknown): Vehicle {
  requireAllowed(role);
  const parsed = vehicleCreateSchema.partial().safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const records = repositories.listVehicles();
  const index = records.findIndex((vehicle) => vehicle.id === id);

  if (index < 0) {
    throw notFound("Vehicle not found.");
  }

  const updated: Vehicle = {
    ...records[index],
    ...parsed.data,
    driverId: parsed.data.driverId ?? records[index].driverId ?? null
  };
  ensureUniquePlate(updated.plateNumber, id);
  records[index] = updated;
  repositories.saveVehicles(records);
  return updated;
}

export function deleteVehicleService(role: UserRole, id: string): { success: true } {
  if (role !== "admin") {
    throw forbidden("Insufficient permissions");
  }

  const vehicles = repositories.listVehicles();
  const trips = repositories.listTrips();

  if (trips.some((trip) => trip.vehicleId === id && trip.status !== "cancelled" && trip.status !== "completed")) {
    throw conflict("Vehicle is assigned to an active trip.");
  }

  const nextVehicles = vehicles.filter((vehicle) => vehicle.id !== id);

  if (nextVehicles.length === vehicles.length) {
    throw notFound("Vehicle not found.");
  }

  repositories.saveVehicles(nextVehicles);
  return { success: true };
}

export function getVehicleById(id: string): Vehicle {
  const vehicle = repositories.listVehicles().find((item) => item.id === id);

  if (!vehicle) {
    throw notFound("Vehicle not found.");
  }

  return vehicle;
}
