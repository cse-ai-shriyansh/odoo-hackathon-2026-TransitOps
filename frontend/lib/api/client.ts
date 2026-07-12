import { ApiError, businessRuleError, validationError } from "@/lib/mock/errors";
import { mockDatabase } from "@/lib/mock/db";
import { delay } from "@/lib/mock/delay";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions<TBody = unknown> {
  method: RequestMethod;
  path: string;
  body?: TBody;
}

export interface ApiResponse<TData> {
  data: TData;
  meta?: Record<string, string | number>;
}

function assertMockMode(): void {
  if (typeof window === "undefined") {
    return;
  }
}

function ensureNotBlank(value: string, field: string): void {
  if (!value.trim()) {
    throw validationError({ [field]: "This field is required." });
  }
}

function ensureBusinessRule(condition: boolean, message: string, details?: Record<string, string>): void {
  if (!condition) {
    throw businessRuleError(message, details);
  }
}

async function respond<TData>(factory: () => TData): Promise<ApiResponse<TData>> {
  await delay(undefined as never);
  return { data: factory() };
}

export async function apiRequest<TData, TBody = unknown>(options: RequestOptions<TBody>): Promise<ApiResponse<TData>> {
  assertMockMode();

  const path = options.path.replace(/\/+$/, "");

  switch (path) {
    case "/auth/session": {
      if (options.method === "POST") {
        const payload = options.body as Record<string, unknown>;
        ensureNotBlank(String(payload.email ?? ""), "email");
        ensureNotBlank(String(payload.password ?? ""), "password");
        ensureNotBlank(String(payload.role ?? ""), "role");
        return respond(() => mockDatabase.authSession as TData);
      }

      return respond(() => mockDatabase.authSession as TData);
    }
    case "/dashboard": {
      return respond(() => mockDatabase.dashboard as TData);
    }
    default:
      break;
  }

  if (path.startsWith("/vehicles")) {
    return handleVehicles<TData, TBody>(options.method, path, options.body);
  }

  if (path.startsWith("/drivers")) {
    return handleDrivers<TData, TBody>(options.method, path, options.body);
  }

  if (path.startsWith("/trips")) {
    return handleTrips<TData, TBody>(options.method, path, options.body);
  }

  if (path.startsWith("/maintenance")) {
    return handleMaintenance<TData, TBody>(options.method, path, options.body);
  }

  if (path.startsWith("/fuel")) {
    return handleFuel<TData, TBody>(options.method, path, options.body);
  }

  if (path.startsWith("/expenses")) {
    return handleExpenses<TData, TBody>(options.method, path, options.body);
  }

  if (path.startsWith("/reports")) {
    return respond(() => ({ generatedAt: new Date().toISOString(), summary: mockDatabase.dashboard } as TData));
  }

  throw new ApiError(404, { message: "Endpoint not found.", code: "NOT_FOUND" });
}

function handleVehicles<TData, TBody>(method: RequestMethod, path: string, body?: TBody): Promise<ApiResponse<TData>> {
  if (method === "GET" && path === "/vehicles") {
    return respond(() => mockDatabase.vehicles as TData);
  }

  if (method === "POST" && path === "/vehicles") {
    const payload = body as Record<string, unknown>;
    ensureNotBlank(String(payload.name ?? ""), "name");
    ensureNotBlank(String(payload.plateNumber ?? ""), "plateNumber");
    ensureBusinessRule(Number(payload.capacityKg ?? 0) > 0, "Vehicle capacity must be positive.", {
      capacityKg: "Capacity must be greater than zero."
    });
    const record = {
      ...payload,
      id: `veh-${mockDatabase.vehicles.length + 100}`
    } as TData;
    mockDatabase.vehicles = [...mockDatabase.vehicles, record as never];
    return respond(() => record);
  }

  if (method === "PATCH" && path.startsWith("/vehicles/")) {
    const id = path.split("/").at(-1) ?? "";
    const payload = body as Record<string, unknown>;
    mockDatabase.vehicles = mockDatabase.vehicles.map((vehicle) =>
      vehicle.id === id ? ({ ...vehicle, ...payload } as never) : vehicle
    );
    const record = mockDatabase.vehicles.find((vehicle) => vehicle.id === id);
    ensureBusinessRule(Boolean(record), "Vehicle not found.");
    return respond(() => record as TData);
  }

  if (method === "DELETE" && path.startsWith("/vehicles/")) {
    const id = path.split("/").at(-1) ?? "";
    mockDatabase.vehicles = mockDatabase.vehicles.filter((vehicle) => vehicle.id !== id);
    return respond(() => ({ success: true } as TData));
  }

  return respond(() => mockDatabase.vehicles as TData);
}

function handleDrivers<TData, TBody>(method: RequestMethod, path: string, body?: TBody): Promise<ApiResponse<TData>> {
  if (method === "GET" && path === "/drivers") {
    return respond(() => mockDatabase.drivers as TData);
  }

  if (method === "POST" && path === "/drivers") {
    const payload = body as Record<string, unknown>;
    ensureNotBlank(String(payload.name ?? ""), "name");
    ensureNotBlank(String(payload.email ?? ""), "email");
    const record = {
      ...payload,
      id: `drv-${mockDatabase.drivers.length + 200}`
    } as TData;
    mockDatabase.drivers = [...mockDatabase.drivers, record as never];
    return respond(() => record);
  }

  if (method === "PATCH" && path.startsWith("/drivers/")) {
    const id = path.split("/").at(-1) ?? "";
    const payload = body as Record<string, unknown>;
    mockDatabase.drivers = mockDatabase.drivers.map((driver) => (driver.id === id ? ({ ...driver, ...payload } as never) : driver));
    const record = mockDatabase.drivers.find((driver) => driver.id === id);
    ensureBusinessRule(Boolean(record), "Driver not found.");
    return respond(() => record as TData);
  }

  if (method === "DELETE" && path.startsWith("/drivers/")) {
    const id = path.split("/").at(-1) ?? "";
    mockDatabase.drivers = mockDatabase.drivers.filter((driver) => driver.id !== id);
    return respond(() => ({ success: true } as TData));
  }

  return respond(() => mockDatabase.drivers as TData);
}

function handleTrips<TData, TBody>(method: RequestMethod, path: string, body?: TBody): Promise<ApiResponse<TData>> {
  if (method === "GET" && path === "/trips") {
    return respond(() => mockDatabase.trips as TData);
  }

  if (method === "POST" && path === "/trips") {
    const payload = body as Record<string, unknown>;
    ensureNotBlank(String(payload.reference ?? ""), "reference");
    ensureBusinessRule(Number(payload.cargoWeightKg ?? 0) > 0, "Cargo weight must be greater than zero.");
    const record = {
      ...payload,
      id: `trip-${mockDatabase.trips.length + 300}`
    } as TData;
    mockDatabase.trips = [...mockDatabase.trips, record as never];
    return respond(() => record);
  }

  if (method === "PATCH" && path.startsWith("/trips/")) {
    const id = path.split("/").at(-1) ?? "";
    const payload = body as Record<string, unknown>;
    mockDatabase.trips = mockDatabase.trips.map((trip) => (trip.id === id ? ({ ...trip, ...payload } as never) : trip));
    const record = mockDatabase.trips.find((trip) => trip.id === id);
    ensureBusinessRule(Boolean(record), "Trip not found.");
    return respond(() => record as TData);
  }

  if (method === "DELETE" && path.startsWith("/trips/")) {
    const id = path.split("/").at(-1) ?? "";
    mockDatabase.trips = mockDatabase.trips.filter((trip) => trip.id !== id);
    return respond(() => ({ success: true } as TData));
  }

  return respond(() => mockDatabase.trips as TData);
}

function handleMaintenance<TData, TBody>(method: RequestMethod, path: string, body?: TBody): Promise<ApiResponse<TData>> {
  if (method === "GET" && path === "/maintenance") {
    return respond(() => mockDatabase.maintenance as TData);
  }

  if (method === "POST" && path === "/maintenance") {
    const payload = body as Record<string, unknown>;
    ensureNotBlank(String(payload.vehicleId ?? ""), "vehicleId");
    const record = { ...payload, id: `mnt-${mockDatabase.maintenance.length + 400}` } as TData;
    mockDatabase.maintenance = [...mockDatabase.maintenance, record as never];
    return respond(() => record);
  }

  if (method === "PATCH" && path.startsWith("/maintenance/")) {
    const id = path.split("/").at(-1) ?? "";
    const payload = body as Record<string, unknown>;
    mockDatabase.maintenance = mockDatabase.maintenance.map((item) => (item.id === id ? ({ ...item, ...payload } as never) : item));
    const record = mockDatabase.maintenance.find((item) => item.id === id);
    ensureBusinessRule(Boolean(record), "Maintenance record not found.");
    return respond(() => record as TData);
  }

  if (method === "DELETE" && path.startsWith("/maintenance/")) {
    const id = path.split("/").at(-1) ?? "";
    mockDatabase.maintenance = mockDatabase.maintenance.filter((item) => item.id !== id);
    return respond(() => ({ success: true } as TData));
  }

  return respond(() => mockDatabase.maintenance as TData);
}

function handleFuel<TData, TBody>(method: RequestMethod, path: string, body?: TBody): Promise<ApiResponse<TData>> {
  if (method === "GET" && path === "/fuel") {
    return respond(() => mockDatabase.fuelLogs as TData);
  }

  if (method === "POST" && path === "/fuel") {
    const payload = body as Record<string, unknown>;
    ensureNotBlank(String(payload.vehicleId ?? ""), "vehicleId");
    const record = { ...payload, id: `fuel-${mockDatabase.fuelLogs.length + 500}` } as TData;
    mockDatabase.fuelLogs = [...mockDatabase.fuelLogs, record as never];
    return respond(() => record);
  }

  if (method === "PATCH" && path.startsWith("/fuel/")) {
    const id = path.split("/").at(-1) ?? "";
    const payload = body as Record<string, unknown>;
    mockDatabase.fuelLogs = mockDatabase.fuelLogs.map((item) => (item.id === id ? ({ ...item, ...payload } as never) : item));
    const record = mockDatabase.fuelLogs.find((item) => item.id === id);
    ensureBusinessRule(Boolean(record), "Fuel log not found.");
    return respond(() => record as TData);
  }

  if (method === "DELETE" && path.startsWith("/fuel/")) {
    const id = path.split("/").at(-1) ?? "";
    mockDatabase.fuelLogs = mockDatabase.fuelLogs.filter((item) => item.id !== id);
    return respond(() => ({ success: true } as TData));
  }

  return respond(() => mockDatabase.fuelLogs as TData);
}

function handleExpenses<TData, TBody>(method: RequestMethod, path: string, body?: TBody): Promise<ApiResponse<TData>> {
  if (method === "GET" && path === "/expenses") {
    return respond(() => mockDatabase.expenses as TData);
  }

  if (method === "POST" && path === "/expenses") {
    const payload = body as Record<string, unknown>;
    ensureNotBlank(String(payload.category ?? ""), "category");
    ensureBusinessRule(Number(payload.amount ?? 0) > 0, "Expense amount must be greater than zero.");
    const record = { ...payload, id: `exp-${mockDatabase.expenses.length + 600}` } as TData;
    mockDatabase.expenses = [...mockDatabase.expenses, record as never];
    return respond(() => record);
  }

  if (method === "PATCH" && path.startsWith("/expenses/")) {
    const id = path.split("/").at(-1) ?? "";
    const payload = body as Record<string, unknown>;
    mockDatabase.expenses = mockDatabase.expenses.map((item) => (item.id === id ? ({ ...item, ...payload } as never) : item));
    const record = mockDatabase.expenses.find((item) => item.id === id);
    ensureBusinessRule(Boolean(record), "Expense not found.");
    return respond(() => record as TData);
  }

  if (method === "DELETE" && path.startsWith("/expenses/")) {
    const id = path.split("/").at(-1) ?? "";
    mockDatabase.expenses = mockDatabase.expenses.filter((item) => item.id !== id);
    return respond(() => ({ success: true } as TData));
  }

  return respond(() => mockDatabase.expenses as TData);
}
