import type { Expense } from "@/types/domain";
import { forbidden, notFound, validationError } from "../errors";
import { repositories } from "../repositories";
import { expenseCreateSchema } from "../validation";
import type { UserRole } from "@/types/domain";

const writeRoles: UserRole[] = ["admin", "fleet_manager", "financial_analyst", "dispatcher"];

function requireAllowed(role: UserRole): void {
  if (!writeRoles.includes(role)) {
    throw forbidden("Insufficient permissions");
  }
}

export function listExpensesService(role: UserRole): Expense[] {
  if (!["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"].includes(role)) {
    throw forbidden("Insufficient permissions");
  }

  return repositories.listExpenses();
}

export function createExpenseService(role: UserRole, body: unknown): Expense {
  requireAllowed(role);
  const parsed = expenseCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const record: Expense = {
    ...parsed.data,
    tripId: parsed.data.tripId ?? null,
    vehicleId: parsed.data.vehicleId ?? null,
    id: crypto.randomUUID()
  };

  repositories.saveExpenses([record, ...repositories.listExpenses()]);
  return record;
}

export function updateExpenseService(role: UserRole, id: string, body: unknown): Expense {
  requireAllowed(role);
  const parsed = expenseCreateSchema.partial().safeParse(body);

  if (!parsed.success) {
    throw validationError("Validation failed", parsed.error.flatten().fieldErrors as Record<string, string>);
  }

  const records = repositories.listExpenses();
  const index = records.findIndex((record) => record.id === id);

  if (index < 0) {
    throw notFound("Expense not found.");
  }

  records[index] = {
    ...records[index],
    ...parsed.data,
    tripId: parsed.data.tripId ?? records[index].tripId ?? null,
    vehicleId: parsed.data.vehicleId ?? records[index].vehicleId ?? null
  };
  repositories.saveExpenses(records);
  return records[index];
}

export function deleteExpenseService(role: UserRole, id: string): { success: true } {
  if (role !== "admin") {
    throw forbidden("Insufficient permissions");
  }

  const records = repositories.listExpenses();
  const nextRecords = records.filter((record) => record.id !== id);

  if (nextRecords.length === records.length) {
    throw notFound("Expense not found.");
  }

  repositories.saveExpenses(nextRecords);
  return { success: true };
}
