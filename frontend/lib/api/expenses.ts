import type { Expense } from "@/types/domain";
import { apiRequest } from "./client";

export type ExpenseInput = Omit<Expense, "id">;

export async function listExpenses(): Promise<Expense[]> {
  const response = await apiRequest<Expense[]>({ method: "GET", path: "/expenses" });
  return response.data;
}

export async function createExpense(input: Partial<ExpenseInput>): Promise<Expense> {
  const response = await apiRequest<Expense, Partial<ExpenseInput>>({ method: "POST", path: "/expenses", body: input });
  return response.data;
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<Expense> {
  const response = await apiRequest<Expense, Partial<ExpenseInput>>({ method: "PATCH", path: `/expenses/${id}`, body: input });
  return response.data;
}

export async function deleteExpense(id: string): Promise<{ success: true }> {
  const response = await apiRequest<{ success: true }>({ method: "DELETE", path: `/expenses/${id}` });
  return response.data;
}
