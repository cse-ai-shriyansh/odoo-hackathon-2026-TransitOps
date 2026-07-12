import type { Driver } from "../../frontend/types/domain";
import { conflict, forbidden, notFound, validationError } from "../errors";
import { repositories } from "../repositories";
import { driverCreateSchema } from "../validation";
import type { UserRole } from "../../frontend/types/domain";

const writeRoles: UserRole[] = ["admin", "fleet_manager", "dispatcher"];

function requireAllowed(role: UserRole): void {
  if (!writeRoles.includes(role)) {
    throw forbidden("Insufficient permissions");
  }
}

function isExpired(licenseExpiry: string): boolean {
  return new Date(licenseExpiry).getTime() < Date.now();
}

export function listDriversService(role: UserRole): Driver[] {
  if (!["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"].includes(role)) {
    throw forbidden("Insufficient permissions");
  }

  return repositories.listDrivers();
}

export function createDriverService(role: UserRole, body: unknown): Driver {
  requireAllowed(role);
  const parsed = driverCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const duplicate = repositories.listDrivers().find((driver) => driver.email === parsed.data.email || driver.licenseNumber === parsed.data.licenseNumber);

  if (duplicate) {
    throw conflict("Driver already exists.");
  }

  const record: Driver = {
    ...parsed.data,
    assignedVehicleId: parsed.data.assignedVehicleId ?? null,
    id: crypto.randomUUID()
  };

  repositories.saveDrivers([record, ...repositories.listDrivers()]);
  return record;
}

export function updateDriverService(role: UserRole, id: string, body: unknown): Driver {
  requireAllowed(role);
  const parsed = driverCreateSchema.partial().safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const drivers = repositories.listDrivers();
  const index = drivers.findIndex((driver) => driver.id === id);

  if (index < 0) {
    throw notFound("Driver not found.");
  }

  const updated: Driver = {
    ...drivers[index],
    ...parsed.data,
    assignedVehicleId: parsed.data.assignedVehicleId ?? drivers[index].assignedVehicleId ?? null
  };

  if (updated.status === "suspended" && updated.assignedVehicleId) {
    throw conflict("Suspended drivers cannot be assigned.");
  }

  if (isExpired(updated.licenseExpiry) && updated.assignedVehicleId) {
    throw conflict("Expired licenses cannot be assigned.");
  }

  drivers[index] = updated;
  repositories.saveDrivers(drivers);
  return updated;
}

export function deleteDriverService(role: UserRole, id: string): { success: true } {
  if (role !== "admin") {
    throw forbidden("Insufficient permissions");
  }

  const drivers = repositories.listDrivers();
  const trips = repositories.listTrips();

  if (trips.some((trip) => trip.driverId === id && trip.status !== "cancelled" && trip.status !== "completed")) {
    throw conflict("Driver is assigned to an active trip.");
  }

  const nextDrivers = drivers.filter((driver) => driver.id !== id);

  if (nextDrivers.length === drivers.length) {
    throw notFound("Driver not found.");
  }

  repositories.saveDrivers(nextDrivers);
  return { success: true };
}
