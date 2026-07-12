import type { Expense } from "../../frontend/types/domain";
import { conflict, forbidden, notFound, validationError } from "../errors";
import { repositories } from "../repositories";
import { expenseCreateSchema } from "../validation";
import type { UserRole } from "../../frontend/types/domain";

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

export async function createExpenseService(role: UserRole, body: unknown): Promise<Expense> {
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
  try {
    const { persistExpenseToSupabase } = await import("../repositories");
    await persistExpenseToSupabase(record);
  } catch (err) {
    console.error("Expense persistence failed:", err);
  }

  return record;
}

export async function updateExpenseService(role: UserRole, id: string, body: unknown): Promise<Expense> {
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

  try {
    const { updateExpenseInSupabase } = await import("../repositories");
    await updateExpenseInSupabase(records[index]);
  } catch (err) {
    console.error("Expense update persistence failed:", err);
  }

  return records[index];
}

export async function deleteExpenseService(role: UserRole, id: string): Promise<{ success: true }> {
  if (role !== "admin") {
    throw forbidden("Insufficient permissions");
  }

  const records = repositories.listExpenses();
  const nextRecords = records.filter((record) => record.id !== id);

  if (nextRecords.length === records.length) {
    throw notFound("Expense not found.");
  }

  repositories.saveExpenses(nextRecords);

  try {
    const { deleteExpenseFromSupabase } = await import("../repositories");
    await deleteExpenseFromSupabase(id);
  } catch (err) {
    console.error("Expense delete persistence failed:", err);
  }

  return { success: true };
}
