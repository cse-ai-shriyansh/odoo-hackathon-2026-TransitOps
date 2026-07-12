import type { FuelLog } from "@/types/domain";
import { conflict, forbidden, validationError } from "../errors";
import { repositories } from "../repositories";
import { fuelCreateSchema } from "../validation";
import type { UserRole } from "@/types/domain";

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

export function createFuelLogService(role: UserRole, body: unknown): FuelLog {
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
  return record;
}
