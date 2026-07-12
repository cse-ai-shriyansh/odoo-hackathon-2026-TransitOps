import type {
  DashboardPayload,
  Driver,
  Expense,
  FuelLog,
  MaintenanceRecord,
  Trip,
  Vehicle
} from "../frontend/types/domain";
import {
  dashboardPayload,
  seededDrivers,
  seededExpenses,
  seededFuelLogs,
  seededMaintenance,
  seededTrips,
  seededVehicles
} from "../frontend/lib/mock/seed";
import { backendStore } from "./store";
import { getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";

function clone<T>(value: T): T {
  return globalThis.structuredClone(value);
}

function toVehicle(row: Record<string, unknown>): Vehicle {
  const status = String(row.status ?? "active");
  return {
    id: String(row.id ?? crypto.randomUUID()),
    plateNumber: String(row.registration_number ?? row.plate_number ?? ""),
    name: [row.make, row.model].filter(Boolean).join(" ") || String(row.name ?? "Vehicle"),
    type: String(row.vehicle_type ?? row.type ?? "other"),
    status: status === "maintenance" ? "in_shop" : status === "retired" ? "retired" : "available",
    driverId: row.driver_id ? String(row.driver_id) : null,
    capacityKg: Number(row.capacity_kg ?? row.capacityKg ?? 0),
    odometerKm: Number(row.odometer_km ?? row.odometerKm ?? 0),
    fuelLevel: Number(row.fuel_level ?? row.fuelLevel ?? 0),
    lastServiceDate: String(row.last_service_date ?? row.created_at ?? new Date().toISOString()),
    destination: String(row.destination ?? ""),
    eta: String(row.eta ?? ""),
    location: {
      lat: Number((row.location as { lat?: number } | undefined)?.lat ?? 0),
      lng: Number((row.location as { lng?: number } | undefined)?.lng ?? 0)
    }
  };
}

function toDriver(row: Record<string, unknown>): Driver {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    name: String(row.full_name ?? row.name ?? "Driver"),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    role: String(row.role ?? "Driver"),
    status: String(row.status ?? "available") === "active" ? "available" : "assigned",
    licenseNumber: String(row.license_number ?? row.licenseNumber ?? ""),
    licenseExpiry: String(row.license_expiry ?? row.licenseExpiry ?? new Date().toISOString()),
    assignedVehicleId: row.assigned_vehicle_id ? String(row.assigned_vehicle_id) : null,
    homeBase: String(row.home_base ?? "")
  };
}

function toTrip(row: Record<string, unknown>): Trip {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    reference: String(row.trip_number ?? row.reference ?? ""),
    status: String(row.status ?? "pending") as Trip["status"],
    origin: String(row.origin ?? ""),
    destination: String(row.destination ?? ""),
    cargoDescription: String(row.cargo_description ?? row.cargoDescription ?? ""),
    cargoWeightKg: Number(row.estimated_distance_km ?? row.cargoWeightKg ?? 0),
    vehicleId: String(row.vehicle_id ?? row.vehicleId ?? ""),
    driverId: String(row.driver_id ?? row.driverId ?? ""),
    plannedDeparture: String(row.scheduled_departure ?? row.plannedDeparture ?? new Date().toISOString()),
    plannedArrival: String(row.scheduled_arrival ?? row.plannedArrival ?? new Date().toISOString()),
    notes: String(row.remarks ?? row.notes ?? "")
  };
}

function toMaintenance(row: Record<string, unknown>): MaintenanceRecord {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    vehicleId: String(row.vehicle_id ?? row.vehicleId ?? ""),
    type: String(row.maintenance_type ?? row.type ?? "other"),
    status: String(row.status ?? "scheduled") as MaintenanceRecord["status"],
    scheduledDate: String(row.maintenance_date ?? row.scheduledDate ?? new Date().toISOString()),
    completedDate: row.completed_date ? String(row.completed_date) : null,
    vendor: String(row.service_provider ?? row.vendor ?? ""),
    cost: Number(row.cost ?? 0),
    notes: String(row.description ?? row.notes ?? "")
  };
}

function toFuelLog(row: Record<string, unknown>): FuelLog {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    vehicleId: String(row.vehicle_id ?? row.vehicleId ?? ""),
    driverId: String(row.driver_id ?? row.driverId ?? ""),
    liters: Number(row.quantity_liters ?? row.liters ?? 0),
    unitPrice: Number(row.price_per_liter ?? row.unitPrice ?? 0),
    totalCost: Number(row.total_cost ?? row.totalCost ?? 0),
    odometerKm: Number(row.odometer_reading_km ?? row.odometerKm ?? 0),
    refuelDate: String(row.fuel_date ?? row.refuelDate ?? new Date().toISOString()),
    station: String(row.fuel_station ?? row.station ?? ""),
    status: String(row.status ?? "submitted") as FuelLog["status"]
  };
}

function toExpense(row: Record<string, unknown>): Expense {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    category: String(row.category ?? "other") as Expense["category"],
    description: String(row.description ?? ""),
    amount: Number(row.amount ?? 0),
    date: String(row.expense_date ?? row.date ?? new Date().toISOString()),
    status: String(row.status ?? "draft") as Expense["status"],
    tripId: row.trip_id ? String(row.trip_id) : null,
    vehicleId: row.vehicle_id ? String(row.vehicle_id) : null
  };
}

function buildDashboardPayload(): DashboardPayload {
  const vehicles = backendStore.vehicles;
  const trips = backendStore.trips;
  const drivers = backendStore.drivers;
  const maintenance = backendStore.maintenance;
  const fuelLogs = backendStore.fuelLogs;
  const expenses = backendStore.expenses;

  return {
    kpis: {
      activeVehicles: vehicles.filter((vehicle) => vehicle.status !== "retired").length,
      availableVehicles: vehicles.filter((vehicle) => vehicle.status === "available").length,
      vehiclesInShop: vehicles.filter((vehicle) => vehicle.status === "in_shop").length,
      activeTrips: trips.filter((trip) => trip.status === "active").length,
      pendingTrips: trips.filter((trip) => trip.status === "pending").length,
      driversAvailable: drivers.filter((driver) => driver.status === "available").length,
      fleetUtilization: Math.round((trips.filter((trip) => trip.status === "active").length / Math.max(vehicles.length, 1)) * 100),
      operationalCost: fuelLogs.reduce((sum, log) => sum + log.totalCost, 0) + maintenance.reduce((sum, record) => sum + record.cost, 0) + expenses.reduce((sum, expense) => sum + expense.amount, 0)
    },
    tripStatus: [
      { label: "Pending", value: trips.filter((trip) => trip.status === "pending").length },
      { label: "Active", value: trips.filter((trip) => trip.status === "active").length },
      { label: "Completed", value: trips.filter((trip) => trip.status === "completed").length },
      { label: "Cancelled", value: trips.filter((trip) => trip.status === "cancelled").length }
    ],
    vehicleUtilization: vehicles.map((vehicle, index) => ({ label: vehicle.name, value: index + 1 })),
    fuelConsumption: fuelLogs.slice(0, 5).map((log) => ({ label: log.station || "Fuel", value: log.totalCost })),
    maintenanceTrend: maintenance.slice(0, 5).map((record) => ({ label: record.type, value: record.cost })),
    expenseBreakdown: expenses.slice(0, 5).map((expense) => ({ label: expense.category, value: expense.amount })),
    fleetMap: vehicles.map((vehicle) => ({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      driverName: drivers.find((driver) => driver.id === vehicle.driverId)?.name ?? "Unassigned",
      status: vehicle.status,
      destination: vehicle.destination,
      eta: vehicle.eta,
      position: vehicle.location
    }))
  };
}

function toDbVehicleStatus(status: string): string {
  switch (status) {
    case "active_trip":
      return "active";
    case "in_shop":
      return "maintenance";
    case "retired":
      return "retired";
    default:
      return "active";
  }
}

function toDbVehicleType(type: string): string {
  const normalized = type.toLowerCase();
  if (normalized.includes("van")) return "van";
  if (normalized.includes("truck") || normalized.includes("flatbed")) return "truck";
  if (normalized.includes("bus")) return "bus";
  if (normalized.includes("car")) return "car";
  if (normalized.includes("trailer")) return "trailer";
  if (normalized.includes("motorcycle")) return "motorcycle";
  return "other";
}

function toDbDriverStatus(status: string): string {
  if (status === "suspended") return "suspended";
  if (status === "assigned") return "active";
  return "active";
}

export async function persistVehicleToSupabase(vehicle: Vehicle, createdBy?: string): Promise<void> {
  const client = getSupabaseAdminClient();

  if (!client) {
    return;
  }

  const profileId = createdBy ?? "345b0109-d9e8-437e-adfb-d7afab877901";
  const row = {
    registration_number: vehicle.plateNumber,
    vin: `VIN-${vehicle.id.slice(-6).toUpperCase()}`,
    make: vehicle.name.split(" ")[0] || "TransitOps",
    model: vehicle.name.split(" ").slice(1).join(" ") || "Fleet",
    manufacturing_year: new Date().getFullYear(),
    vehicle_type: toDbVehicleType(vehicle.type),
    fuel_type: "diesel",
    capacity_kg: vehicle.capacityKg,
    status: toDbVehicleStatus(vehicle.status),
    created_by: profileId
  };

  await client.from("vehicles").insert(row);
}

export async function updateVehicleInSupabase(vehicle: Vehicle, oldPlate?: string): Promise<void> {
  const client = getSupabaseAdminClient();
  if (!client) return;

  const identifierPlate = oldPlate ?? vehicle.plateNumber;

  const row = {
    registration_number: vehicle.plateNumber,
    make: vehicle.name.split(" ")[0] || "TransitOps",
    model: vehicle.name.split(" ").slice(1).join(" ") || "Fleet",
    vehicle_type: toDbVehicleType(vehicle.type),
    capacity_kg: vehicle.capacityKg,
    status: toDbVehicleStatus(vehicle.status)
  };

  await client.from("vehicles").update(row).eq("registration_number", identifierPlate).throwOnError();
}

export async function deleteVehicleFromSupabase(plateNumber: string): Promise<void> {
  const client = getSupabaseAdminClient();
  if (!client) return;

  await client.from("vehicles").delete().eq("registration_number", plateNumber).throwOnError();
}

export async function persistDriverToSupabase(driver: Driver, createdBy?: string): Promise<void> {
  const client = getSupabaseAdminClient();

  if (!client) return;

  const profileId = createdBy ?? null;
  const row = {
    id: driver.id,
    employee_code: `EMP-${driver.id.slice(-4)}`,
    full_name: driver.name,
    phone: driver.phone,
    email: driver.email,
    license_number: driver.licenseNumber,
    license_expiry: driver.licenseExpiry.slice(0, 10),
    status: driver.status === "suspended" ? "suspended" : "active",
    created_by: profileId
  };

  await client.from("drivers").insert(row).throwOnError();
}

export async function persistTripToSupabase(trip: Trip, createdBy?: string): Promise<void> {
  const client = getSupabaseAdminClient();

  if (!client) return;

  const row = {
    id: trip.id,
    trip_number: trip.reference,
    vehicle_id: trip.vehicleId || null,
    driver_id: trip.driverId || null,
    dispatched_by: createdBy ?? null,
    origin: trip.origin,
    destination: trip.destination,
    scheduled_departure: trip.plannedDeparture,
    scheduled_arrival: trip.plannedArrival,
    estimated_distance_km: trip.cargoWeightKg,
    status: trip.status === "completed" ? "completed" : trip.status === "active" ? "dispatched" : "scheduled",
    remarks: trip.notes
  };

  await client.from("trips").insert(row).throwOnError();
}

export async function persistMaintenanceToSupabase(record: MaintenanceRecord, createdBy?: string): Promise<void> {
  const client = getSupabaseAdminClient();
  if (!client) return;

  const row = {
    id: record.id,
    vehicle_id: record.vehicleId,
    maintenance_type: record.type,
    description: record.notes,
    maintenance_date: record.scheduledDate.slice(0, 10),
    next_due_date: record.scheduledDate.slice(0, 10),
    cost: record.cost,
    service_provider: record.vendor,
    status: record.status,
    created_by: createdBy ?? null
  };

  await client.from("maintenance_logs").insert(row).throwOnError();
}

export async function persistFuelLogToSupabase(log: FuelLog, createdBy?: string): Promise<void> {
  const client = getSupabaseAdminClient();
  if (!client) return;

  const row = {
    id: log.id,
    vehicle_id: log.vehicleId,
    driver_id: log.driverId,
    fuel_date: log.refuelDate,
    fuel_station: log.station,
    fuel_type: "diesel",
    quantity_liters: log.liters,
    price_per_liter: log.unitPrice,
    odometer_reading_km: log.odometerKm,
    total_cost: log.totalCost,
    status: log.status,
    created_by: createdBy ?? null
  };

  await client.from("fuel_logs").insert(row).throwOnError();
}

export async function persistExpenseToSupabase(expense: Expense, createdBy?: string): Promise<void> {
  const client = getSupabaseAdminClient();
  if (!client) return;

  const row = {
    id: expense.id,
    expense_number: `EXP-${expense.id.slice(-6)}`,
    vehicle_id: expense.vehicleId ?? null,
    driver_id: null,
    trip_id: expense.tripId ?? null,
    created_by: createdBy ?? null,
    expense_date: expense.date.slice(0, 10),
    category: expense.category,
    amount: expense.amount,
    description: expense.description,
    status: expense.status
  };

  await client.from("expenses").insert(row).throwOnError();
}

async function seedSupabaseFromMockData(client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>) {
  const { data: existingProfiles } = await client.from("profiles").select("id").limit(1);

  if (existingProfiles && existingProfiles.length > 0) {
    return;
  }

  const adminEmail = "dana.holt@transitops.test";
  const { data: usersData } = await client.auth.admin.listUsers();
  const existingUser = usersData?.users.find((user) => user.email === adminEmail);
  const profileId = existingUser?.id ?? (await client.auth.admin.createUser({
    email: adminEmail,
    password: "transitops",
    email_confirm: true,
    user_metadata: { full_name: "Dana Holt" }
  })).data.user?.id;

  if (!profileId) {
    throw new Error("Unable to create a Supabase auth user for seeding.");
  }

  await client.from("profiles").upsert({
    id: profileId,
    full_name: "Dana Holt",
    role: "admin"
  }, { onConflict: "id" });

  const vehicleRows = seededVehicles.map((vehicle, index) => ({
    registration_number: vehicle.plateNumber,
    vin: `VIN-${String(index + 1).padStart(4, "0")}`,
    make: vehicle.name.split(" ")[0] || "TransitOps",
    model: vehicle.name.split(" ").slice(1).join(" ") || "Fleet",
    manufacturing_year: 2020 + index,
    vehicle_type: toDbVehicleType(vehicle.type),
    fuel_type: "diesel",
    capacity_kg: vehicle.capacityKg,
    status: toDbVehicleStatus(vehicle.status),
    created_by: profileId
  }));

  const { data: insertedVehicles } = await client.from("vehicles").insert(vehicleRows).select("id");
  const insertedVehicleIds = (insertedVehicles ?? []).map((row) => String(row.id));

  const driverRows = seededDrivers.map((driver, index) => ({
    employee_code: `EMP-${String(index + 1).padStart(3, "0")}`,
    full_name: driver.name,
    phone: driver.phone,
    email: driver.email,
    license_number: driver.licenseNumber,
    license_class: "A",
    license_expiry: driver.licenseExpiry.slice(0, 10),
    date_of_birth: "1990-01-01",
    hire_date: "2020-01-01",
    status: toDbDriverStatus(driver.status),
    emergency_contact_name: driver.name,
    emergency_contact_phone: driver.phone,
    created_by: profileId
  }));

  const { data: insertedDrivers } = await client.from("drivers").insert(driverRows).select("id");
  const insertedDriverIds = (insertedDrivers ?? []).map((row) => String(row.id));

  const tripRows = seededTrips.map((trip, index) => ({
    trip_number: trip.reference,
    vehicle_id: insertedVehicleIds[index % insertedVehicleIds.length],
    driver_id: insertedDriverIds[index % insertedDriverIds.length],
    dispatched_by: profileId,
    origin: trip.origin,
    destination: trip.destination,
    scheduled_departure: trip.plannedDeparture,
    scheduled_arrival: trip.plannedArrival,
    estimated_distance_km: trip.cargoWeightKg,
    status: trip.status === "completed" ? "completed" : trip.status === "active" ? "dispatched" : "scheduled",
    remarks: trip.notes,
    created_at: new Date().toISOString()
  }));

  await client.from("trips").insert(tripRows);

  const maintenanceRows = seededMaintenance.map((record) => ({
    vehicle_id: insertedVehicleIds[0],
    maintenance_type: record.type.includes("Brake") ? "brake_service" : record.type.includes("Engine") ? "engine_service" : "inspection",
    description: record.notes,
    maintenance_date: record.scheduledDate.slice(0, 10),
    next_due_date: record.scheduledDate.slice(0, 10),
    odometer_reading_km: 80000,
    cost: record.cost,
    service_provider: record.vendor,
    invoice_number: `INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: record.status === "completed" ? "completed" : record.status === "in_progress" ? "in_progress" : "scheduled",
    created_by: profileId
  }));

  await client.from("maintenance_logs").insert(maintenanceRows);

  const fuelRows = seededFuelLogs.map((log, index) => ({
    vehicle_id: insertedVehicleIds[index % insertedVehicleIds.length],
    driver_id: insertedDriverIds[index % insertedDriverIds.length],
    trip_id: null,
    created_by: profileId,
    fuel_date: log.refuelDate,
    fuel_station: log.station,
    fuel_type: "diesel",
    quantity_liters: log.liters,
    price_per_liter: log.unitPrice,
    odometer_reading_km: log.odometerKm,
    payment_method: "card",
    receipt_number: `FUEL-${index + 1}`,
    remarks: log.station,
    created_at: new Date().toISOString()
  }));

  await client.from("fuel_logs").insert(fuelRows);

  const expenseRows = seededExpenses.map((expense, index) => ({
    expense_number: `EXP-${index + 1}`,
    vehicle_id: insertedVehicleIds[index % insertedVehicleIds.length] ?? null,
    driver_id: insertedDriverIds[index % insertedDriverIds.length] ?? null,
    trip_id: null,
    created_by: profileId,
    expense_date: expense.date.slice(0, 10),
    category: expense.category === "fuel" ? "fuel" : expense.category === "maintenance" ? "maintenance" : "other",
    amount: expense.amount,
    payment_method: "company_account",
    vendor_name: "TransitOps",
    invoice_number: `INV-EXP-${index + 1}`,
    description: expense.description,
    receipt_url: null,
    status: expense.status === "approved" ? "approved" : "pending",
    approved_by: profileId,
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }));

  await client.from("expenses").insert(expenseRows);
}

export async function initializeRepositoriesFromSupabase(): Promise<void> {
  if (backendStore.hydratedFromSupabase || !isSupabaseConfigured()) {
    return;
  }

  const client = getSupabaseAdminClient();

  if (!client) {
    return;
  }

  try {
    const [{ data: vehiclesData }, { data: driversData }, { data: tripsData }, { data: maintenanceData }, { data: fuelData }, { data: expensesData }] = await Promise.all([
      client.from("vehicles").select("*").limit(200),
      client.from("drivers").select("*").limit(200),
      client.from("trips").select("*").limit(200),
      client.from("maintenance_logs").select("*").limit(200),
      client.from("fuel_logs").select("*").limit(200),
      client.from("expenses").select("*").limit(200)
    ]);

    if ((!vehiclesData || vehiclesData.length === 0) && (!driversData || driversData.length === 0)) {
      await seedSupabaseFromMockData(client);
    }

    const [{ data: seededVehiclesData }, { data: seededDriversData }, { data: seededTripsData }, { data: seededMaintenanceData }, { data: seededFuelData }, { data: seededExpensesData }] = await Promise.all([
      client.from("vehicles").select("*").limit(200),
      client.from("drivers").select("*").limit(200),
      client.from("trips").select("*").limit(200),
      client.from("maintenance_logs").select("*").limit(200),
      client.from("fuel_logs").select("*").limit(200),
      client.from("expenses").select("*").limit(200)
    ]);

    backendStore.vehicles = (seededVehiclesData ?? []).map((row) => toVehicle(row as Record<string, unknown>));
    backendStore.drivers = (seededDriversData ?? []).map((row) => toDriver(row as Record<string, unknown>));
    backendStore.trips = (seededTripsData ?? []).map((row) => toTrip(row as Record<string, unknown>));
    backendStore.maintenance = (seededMaintenanceData ?? []).map((row) => toMaintenance(row as Record<string, unknown>));
    backendStore.fuelLogs = (seededFuelData ?? []).map((row) => toFuelLog(row as Record<string, unknown>));
    backendStore.expenses = (seededExpensesData ?? []).map((row) => toExpense(row as Record<string, unknown>));
    backendStore.dashboard = buildDashboardPayload();
    backendStore.hydratedFromSupabase = true;
  } catch (error) {
    backendStore.vehicles = clone(seededVehicles);
    backendStore.drivers = clone(seededDrivers);
    backendStore.trips = clone(seededTrips);
    backendStore.maintenance = clone(seededMaintenance);
    backendStore.fuelLogs = clone(seededFuelLogs);
    backendStore.expenses = clone(seededExpenses);
    backendStore.dashboard = clone(dashboardPayload);
    backendStore.hydratedFromSupabase = true;
  }
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
