import type { UserRole } from "@/types/domain";

export const RESOURCE_ROLES: Record<string, UserRole[]> = {
  readAll: ["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"],
  fleetWrite: ["admin", "fleet_manager"],
  dispatcherWrite: ["admin", "fleet_manager", "dispatcher"],
  safetyWrite: ["admin", "fleet_manager", "safety_officer"],
  financeWrite: ["admin", "fleet_manager", "financial_analyst"],
  reports: ["admin", "financial_analyst"]
} as const;
