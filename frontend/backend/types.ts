import type {
  AuthSession,
  DashboardPayload,
  Driver,
  Expense,
  FuelLog,
  MaintenanceRecord,
  Trip,
  Vehicle,
  UserRole
} from "@/types/domain";

export type ResourceName = "vehicles" | "drivers" | "trips" | "maintenance" | "fuel" | "expenses";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface BackendState {
  session: AuthSession | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
}

export interface SuccessEnvelope<TData> {
  success: true;
  data: TData;
}

export interface ErrorEnvelope {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type ApiEnvelope<TData> = SuccessEnvelope<TData> | ErrorEnvelope;

export type DashboardResponse = DashboardPayload;
