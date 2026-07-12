import type { Driver, Expense, FuelLog, MaintenanceRecord, Trip, Vehicle } from "../frontend/types/domain";
import { backendStore } from "./store";

function clone<T>(value: T): T {
  return globalThis.structuredClone(value);
}

export const repositories = {
  getSession() {
    return backendStore.session ? clone(backendStore.session) : null;
  },
  setSession(session: typeof backendStore.session) {
    backendStore.session = session ? clone(session) : null;
  },
  listVehicles(): Vehicle[] {
    return clone(backendStore.vehicles);
  },
  saveVehicles(records: Vehicle[]): void {
    backendStore.vehicles = clone(records);
  },
  listDrivers(): Driver[] {
    return clone(backendStore.drivers);
  },
  saveDrivers(records: Driver[]): void {
    backendStore.drivers = clone(records);
  },
  listTrips(): Trip[] {
    return clone(backendStore.trips);
  },
  saveTrips(records: Trip[]): void {
    backendStore.trips = clone(records);
  },
  listMaintenance(): MaintenanceRecord[] {
    return clone(backendStore.maintenance);
  },
  saveMaintenance(records: MaintenanceRecord[]): void {
    backendStore.maintenance = clone(records);
  },
  listFuelLogs(): FuelLog[] {
    return clone(backendStore.fuelLogs);
  },
  saveFuelLogs(records: FuelLog[]): void {
    backendStore.fuelLogs = clone(records);
  },
  listExpenses(): Expense[] {
    return clone(backendStore.expenses);
  },
  saveExpenses(records: Expense[]): void {
    backendStore.expenses = clone(records);
  },
  getDashboard() {
    return clone(backendStore.dashboard);
  }
};
