export type UserRole =
  | "admin"
  | "fleet_manager"
  | "dispatcher"
  | "safety_officer"
  | "financial_analyst";

export type VehicleStatus = "available" | "active_trip" | "in_shop" | "retired";
export type DriverStatus = "available" | "assigned" | "suspended";
export type TripStatus = "pending" | "active" | "completed" | "cancelled";
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed";
export type FuelStatus = "draft" | "submitted" | "approved";
export type ExpenseCategory =
  | "fuel"
  | "maintenance"
  | "tolls"
  | "insurance"
  | "salaries"
  | "other";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  name: string;
  type: string;
  status: VehicleStatus;
  driverId: string | null;
  capacityKg: number;
  odometerKm: number;
  fuelLevel: number;
  lastServiceDate: string;
  destination: string;
  eta: string;
  location: Coordinates;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  status: DriverStatus;
  licenseNumber: string;
  licenseExpiry: string;
  assignedVehicleId: string | null;
  homeBase: string;
}

export interface Trip {
  id: string;
  reference: string;
  status: TripStatus;
  origin: string;
  destination: string;
  cargoDescription: string;
  cargoWeightKg: number;
  vehicleId: string;
  driverId: string;
  plannedDeparture: string;
  plannedArrival: string;
  notes: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate: string | null;
  vendor: string;
  cost: number;
  notes: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  driverId: string;
  liters: number;
  unitPrice: number;
  totalCost: number;
  odometerKm: number;
  refuelDate: string;
  station: string;
  status: FuelStatus;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  tripId: string | null;
  vehicleId: string | null;
}

export interface DashboardKpis {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInShop: number;
  activeTrips: number;
  pendingTrips: number;
  driversAvailable: number;
  fleetUtilization: number;
  operationalCost: number;
}

export interface FleetMapPoint {
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  status: VehicleStatus;
  destination: string;
  eta: string;
  position: Coordinates;
}

export interface ChartSeriesPoint {
  label: string;
  value: number;
}

export interface DashboardPayload {
  kpis: DashboardKpis;
  tripStatus: ChartSeriesPoint[];
  vehicleUtilization: ChartSeriesPoint[];
  fuelConsumption: ChartSeriesPoint[];
  maintenanceTrend: ChartSeriesPoint[];
  expenseBreakdown: ChartSeriesPoint[];
  fleetMap: FleetMapPoint[];
}

export interface AuthSession {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  expiresAt: string;
}

export interface ApiErrorPayload {
  message: string;
  code: string;
  details?: Record<string, string>;
}
