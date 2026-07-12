import type { AuthSession, DashboardPayload, Driver, Expense, FuelLog, MaintenanceRecord, Trip, Vehicle } from "../frontend/types/domain";
import {
  dashboardPayload,
  seededDrivers,
  seededExpenses,
  seededFuelLogs,
  seededMaintenance,
  seededTrips,
  seededVehicles
} from "../frontend/lib/mock/seed";

export interface BackendStore {
  session: AuthSession | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  dashboard: DashboardPayload;
  hydratedFromSupabase: boolean;
}

function clone<T>(value: T): T {
  return globalThis.structuredClone(value);
}

export const backendStore: BackendStore = {
  session: null,
  vehicles: clone(seededVehicles),
  drivers: clone(seededDrivers),
  trips: clone(seededTrips),
  maintenance: clone(seededMaintenance),
  fuelLogs: clone(seededFuelLogs),
  expenses: clone(seededExpenses),
  dashboard: clone(dashboardPayload),
  hydratedFromSupabase: false
};
