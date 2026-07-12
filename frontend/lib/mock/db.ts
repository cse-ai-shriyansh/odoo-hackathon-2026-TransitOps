import {
  dashboardPayload,
  seededAuthSession,
  seededDrivers,
  seededExpenses,
  seededFuelLogs,
  seededMaintenance,
  seededTrips,
  seededVehicles
} from "./seed";
import type { AuthSession, DashboardPayload, Driver, Expense, FuelLog, MaintenanceRecord, Trip, Vehicle } from "@/types/domain";

export interface MockDatabase {
  authSession: AuthSession;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  dashboard: DashboardPayload;
}

export const mockDatabase: MockDatabase = {
  authSession: seededAuthSession,
  vehicles: seededVehicles,
  drivers: seededDrivers,
  trips: seededTrips,
  maintenance: seededMaintenance,
  fuelLogs: seededFuelLogs,
  expenses: seededExpenses,
  dashboard: dashboardPayload
};
