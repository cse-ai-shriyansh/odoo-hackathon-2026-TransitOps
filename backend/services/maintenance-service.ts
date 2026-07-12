import type { MaintenanceRecord } from "../../frontend/types/domain";
import { conflict, forbidden, notFound, validationError } from "../errors";
import { repositories } from "../repositories";
import { maintenanceCreateSchema } from "../validation";
import type { UserRole } from "../../frontend/types/domain";

const writeRoles: UserRole[] = ["admin", "fleet_manager", "safety_officer"];

function requireAllowed(role: UserRole): void {
  if (!writeRoles.includes(role)) {
    throw forbidden("Insufficient permissions");
  }
}

export function listMaintenanceService(role: UserRole): MaintenanceRecord[] {
  if (!["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"].includes(role)) {
    throw forbidden("Insufficient permissions");
  }

  return repositories.listMaintenance();
}

export async function createMaintenanceService(role: UserRole, body: unknown): Promise<MaintenanceRecord> {
  requireAllowed(role);
  const parsed = maintenanceCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const vehicle = repositories.listVehicles().find((item) => item.id === parsed.data.vehicleId);

  if (!vehicle) {
    throw conflict("Vehicle does not exist.");
  }

  const record: MaintenanceRecord = {
    ...parsed.data,
    completedDate: parsed.data.completedDate ?? null,
    id: crypto.randomUUID()
  };

  repositories.saveMaintenance([record, ...repositories.listMaintenance()]);
  repositories.saveVehicles(repositories.listVehicles().map((item) => (item.id === vehicle.id ? { ...item, status: "in_shop" } : item)));
  try {
    const { persistMaintenanceToSupabase } = await import("../repositories");
    await persistMaintenanceToSupabase(record);
  } catch (err) {
    console.error("Maintenance persistence failed:", err);
  }

  return record;
}

export function updateMaintenanceService(role: UserRole, id: string, body: unknown): MaintenanceRecord {
  requireAllowed(role);
  const parsed = maintenanceCreateSchema.partial().safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const records = repositories.listMaintenance();
  const index = records.findIndex((record) => record.id === id);

  if (index < 0) {
    throw notFound("Maintenance record not found.");
  }

  const updated: MaintenanceRecord = {
    ...records[index],
    ...parsed.data,
    completedDate: parsed.data.completedDate ?? records[index].completedDate ?? null
  };
  records[index] = updated;
  repositories.saveMaintenance(records);
  return updated;
}

export function completeMaintenanceService(role: UserRole, id: string): MaintenanceRecord {
  requireAllowed(role);

  const records = repositories.listMaintenance();
  const index = records.findIndex((record) => record.id === id);

  if (index < 0) {
    throw notFound("Maintenance record not found.");
  }

  const record = records[index];
  records[index] = { ...record, status: "completed", completedDate: new Date().toISOString() };
  repositories.saveMaintenance(records);

  const vehicles = repositories.listVehicles();
  const vehicleIndex = vehicles.findIndex((vehicle) => vehicle.id === record.vehicleId);

  if (vehicleIndex >= 0 && vehicles[vehicleIndex].status !== "retired") {
    vehicles[vehicleIndex] = { ...vehicles[vehicleIndex], status: "available" };
    repositories.saveVehicles(vehicles);
  }

  return records[index];
}

export function deleteMaintenanceService(role: UserRole, id: string): { success: true } {
  if (role !== "admin") {
    throw forbidden("Insufficient permissions");
  }

  const records = repositories.listMaintenance();
  const nextRecords = records.filter((record) => record.id !== id);

  if (nextRecords.length === records.length) {
    throw notFound("Maintenance record not found.");
  }

  repositories.saveMaintenance(nextRecords);
  return { success: true };
}
