import type { FuelLog } from "../../frontend/types/domain";
import { conflict, forbidden, notFound, validationError } from "../errors";
import { repositories } from "../repositories";
import { fuelCreateSchema } from "../validation";
import type { UserRole } from "../../frontend/types/domain";

const writeRoles: UserRole[] = ["admin", "fleet_manager", "dispatcher"];

function requireAllowed(role: UserRole): void {
  if (!writeRoles.includes(role)) {
    throw forbidden("Insufficient permissions");
  }
}

export function listFuelLogsService(role: UserRole): FuelLog[] {
  if (!["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"].includes(role)) {
    throw forbidden("Insufficient permissions");
  }

  return repositories.listFuelLogs();
}

export async function createFuelLogService(role: UserRole, body: unknown): Promise<FuelLog> {
  requireAllowed(role);
  const parsed = fuelCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const record: FuelLog = {
    ...parsed.data,
    id: crypto.randomUUID(),
    totalCost: Math.round(parsed.data.liters * parsed.data.unitPrice)
  };

  if (record.totalCost <= 0) {
    throw conflict("Fuel total cost must be positive.");
  }

  repositories.saveFuelLogs([record, ...repositories.listFuelLogs()]);
  try {
    const { persistFuelLogToSupabase } = await import("../repositories");
    await persistFuelLogToSupabase(record);
  } catch (err) {
    console.error("Fuel log persistence failed:", err);
  }

  return record;
}

export async function updateFuelLogService(role: UserRole, id: string, body: unknown): Promise<FuelLog> {
  requireAllowed(role);
  const parsed = fuelCreateSchema.partial().safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const records = repositories.listFuelLogs();
  const index = records.findIndex((r) => r.id === id);

  if (index < 0) {
    throw notFound("Fuel log not found.");
  }

  const updated: FuelLog = {
    ...records[index],
    ...parsed.data
  } as FuelLog;

  updated.totalCost = Math.round((parsed.data.liters ?? updated.liters) * (parsed.data.unitPrice ?? updated.unitPrice));

  records[index] = updated;
  repositories.saveFuelLogs(records);

  try {
    const { updateFuelLogInSupabase } = await import("../repositories");
    await updateFuelLogInSupabase(updated);
  } catch (err) {
    console.error("Fuel log update persistence failed:", err);
  }

  return updated;
}

export async function deleteFuelLogService(role: UserRole, id: string): Promise<{ success: true }> {
  if (role !== "admin" && role !== "fleet_manager") {
    throw forbidden("Insufficient permissions");
  }

  const records = repositories.listFuelLogs();
  const nextRecords = records.filter((r) => r.id !== id);

  if (nextRecords.length === records.length) {
    throw notFound("Fuel log not found.");
  }

  repositories.saveFuelLogs(nextRecords);

  try {
    const { deleteFuelLogFromSupabase } = await import("../repositories");
    await deleteFuelLogFromSupabase(id);
  } catch (err) {
    console.error("Fuel log delete persistence failed:", err);
  }

  return { success: true };
}
