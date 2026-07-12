import type { Trip } from "../../frontend/types/domain";
import { conflict, forbidden, notFound, validationError } from "../errors";
import { repositories } from "../repositories";
import { tripActionSchema, tripCreateSchema } from "../validation";
import type { UserRole } from "../../frontend/types/domain";

const writeRoles: UserRole[] = ["admin", "fleet_manager", "dispatcher"];

function requireAllowed(role: UserRole): void {
  if (!writeRoles.includes(role)) {
    throw forbidden("Insufficient permissions");
  }
}

function getVehicle(id: string) {
  return repositories.listVehicles().find((vehicle) => vehicle.id === id);
}

function getDriver(id: string) {
  return repositories.listDrivers().find((driver) => driver.id === id);
}

function ensureDispatchable(vehicleId: string, driverId: string, cargoWeightKg: number): void {
  const vehicle = getVehicle(vehicleId);
  const driver = getDriver(driverId);

  if (!vehicle) {
    throw conflict("Vehicle does not exist.");
  }

  if (!driver) {
    throw conflict("Driver does not exist.");
  }

  if (vehicle.status === "retired") {
    throw conflict("Retired vehicles cannot be dispatched.");
  }

  if (vehicle.status === "in_shop") {
    throw conflict("Vehicles in shop cannot be dispatched.");
  }

  if (vehicle.status === "active_trip") {
    throw conflict("Vehicles already on trip cannot be dispatched.");
  }

  if (driver.status === "suspended") {
    throw conflict("Suspended drivers cannot be assigned.");
  }

  if (new Date(driver.licenseExpiry).getTime() < Date.now()) {
    throw conflict("Drivers with expired licenses cannot be assigned.");
  }

  if (driver.status === "assigned") {
    throw conflict("Drivers already on trip cannot be assigned.");
  }

  if (cargoWeightKg > vehicle.capacityKg) {
    throw conflict("Cargo weight cannot exceed vehicle capacity.");
  }
}

export function listTripsService(role: UserRole): Trip[] {
  if (!["admin", "fleet_manager", "dispatcher"].includes(role)) {
    throw forbidden("Insufficient permissions");
  }

  return repositories.listTrips();
}

export async function createTripService(role: UserRole, body: unknown): Promise<Trip> {
  requireAllowed(role);
  const parsed = tripCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  ensureDispatchable(parsed.data.vehicleId, parsed.data.driverId, parsed.data.cargoWeightKg);

  const record: Trip = {
    ...parsed.data,
    id: crypto.randomUUID()
  };

  repositories.saveTrips([record, ...repositories.listTrips()]);

  try {
    const { persistTripToSupabase } = await import("../repositories");
    await persistTripToSupabase(record);
  } catch (err) {
    console.error("Trip persistence failed:", err);
  }

  return record;
}

export function updateTripService(role: UserRole, id: string, body: unknown): Trip {
  requireAllowed(role);
  const parsed = tripCreateSchema.partial().safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const trips = repositories.listTrips();
  const index = trips.findIndex((trip) => trip.id === id);

  if (index < 0) {
    throw notFound("Trip not found.");
  }

  const updated = { ...trips[index], ...parsed.data };

  if (parsed.data.vehicleId || parsed.data.driverId || parsed.data.cargoWeightKg) {
    ensureDispatchable(updated.vehicleId, updated.driverId, updated.cargoWeightKg);
  }

  trips[index] = updated;
  repositories.saveTrips(trips);
  return updated;
}

export function dispatchTripService(role: UserRole, id: string): Trip {
  requireAllowed(role);
  const trips = repositories.listTrips();
  const index = trips.findIndex((trip) => trip.id === id);

  if (index < 0) {
    throw notFound("Trip not found.");
  }

  const trip = trips[index];
  ensureDispatchable(trip.vehicleId, trip.driverId, trip.cargoWeightKg);

  const vehicles = repositories.listVehicles();
  const drivers = repositories.listDrivers();
  const vehicleIndex = vehicles.findIndex((vehicle) => vehicle.id === trip.vehicleId);
  const driverIndex = drivers.findIndex((driver) => driver.id === trip.driverId);

  vehicles[vehicleIndex] = { ...vehicles[vehicleIndex], status: "active_trip" };
  drivers[driverIndex] = { ...drivers[driverIndex], status: "assigned", assignedVehicleId: trip.vehicleId };
  trips[index] = { ...trip, status: "active" };

  repositories.saveVehicles(vehicles);
  repositories.saveDrivers(drivers);
  repositories.saveTrips(trips);
  return trips[index];
}

export function completeTripService(role: UserRole, id: string, body: unknown): Trip {
  requireAllowed(role);
  const parsed = tripActionSchema.safeParse(body ?? {});

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const trips = repositories.listTrips();
  const index = trips.findIndex((trip) => trip.id === id);

  if (index < 0) {
    throw notFound("Trip not found.");
  }

  const trip = trips[index];
  const vehicles = repositories.listVehicles();
  const drivers = repositories.listDrivers();
  const vehicleIndex = vehicles.findIndex((vehicle) => vehicle.id === trip.vehicleId);
  const driverIndex = drivers.findIndex((driver) => driver.id === trip.driverId);

  vehicles[vehicleIndex] = { ...vehicles[vehicleIndex], status: "available", odometerKm: parsed.data.odometerKm ?? vehicles[vehicleIndex].odometerKm };
  drivers[driverIndex] = { ...drivers[driverIndex], status: "available", assignedVehicleId: null };
  trips[index] = {
    ...trip,
    status: "completed",
    notes: parsed.data.notes ? `${trip.notes}\n${parsed.data.notes}` : trip.notes
  };

  repositories.saveVehicles(vehicles);
  repositories.saveDrivers(drivers);
  repositories.saveTrips(trips);
  return trips[index];
}

export function cancelTripService(role: UserRole, id: string): Trip {
  requireAllowed(role);
  const trips = repositories.listTrips();
  const index = trips.findIndex((trip) => trip.id === id);

  if (index < 0) {
    throw notFound("Trip not found.");
  }

  const trip = trips[index];
  const vehicles = repositories.listVehicles();
  const drivers = repositories.listDrivers();
  const vehicleIndex = vehicles.findIndex((vehicle) => vehicle.id === trip.vehicleId);
  const driverIndex = drivers.findIndex((driver) => driver.id === trip.driverId);

  if (vehicleIndex >= 0 && vehicles[vehicleIndex].status === "active_trip") {
    vehicles[vehicleIndex] = { ...vehicles[vehicleIndex], status: "available" };
  }

  if (driverIndex >= 0 && drivers[driverIndex].status === "assigned") {
    drivers[driverIndex] = { ...drivers[driverIndex], status: "available", assignedVehicleId: null };
  }

  trips[index] = { ...trip, status: "cancelled" };

  repositories.saveVehicles(vehicles);
  repositories.saveDrivers(drivers);
  repositories.saveTrips(trips);
  return trips[index];
}

export function deleteTripService(role: UserRole, id: string): { success: true } {
  if (role !== "admin" && role !== "fleet_manager") {
    throw forbidden("Insufficient permissions");
  }

  const trips = repositories.listTrips();
  const nextTrips = trips.filter((trip) => trip.id !== id);

  if (nextTrips.length === trips.length) {
    throw notFound("Trip not found.");
  }

  repositories.saveTrips(nextTrips);
  return { success: true };
}
