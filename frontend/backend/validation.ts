import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  role: z.enum(["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"])
});

export const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export const vehicleCreateSchema = z.object({
  plateNumber: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(["available", "active_trip", "in_shop", "retired"]),
  capacityKg: z.number().positive(),
  odometerKm: z.number().nonnegative(),
  fuelLevel: z.number().min(0).max(100),
  lastServiceDate: z.string().min(1),
  destination: z.string().min(1),
  eta: z.string().min(1),
  driverId: z.string().nullable().optional(),
  location: coordinatesSchema
});

export const driverCreateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  status: z.enum(["available", "assigned", "suspended"]),
  licenseNumber: z.string().min(1),
  licenseExpiry: z.string().min(1),
  assignedVehicleId: z.string().nullable().optional(),
  homeBase: z.string().min(1)
});

export const tripCreateSchema = z.object({
  reference: z.string().min(1),
  status: z.enum(["pending", "active", "completed", "cancelled"]),
  origin: z.string().min(1),
  destination: z.string().min(1),
  cargoDescription: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  plannedDeparture: z.string().min(1),
  plannedArrival: z.string().min(1),
  notes: z.string().min(1)
});

export const tripActionSchema = z.object({
  odometerKm: z.number().nonnegative().optional(),
  fuelUsedLiters: z.number().nonnegative().optional(),
  notes: z.string().optional()
});

export const maintenanceCreateSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(["scheduled", "in_progress", "completed"]),
  scheduledDate: z.string().min(1),
  completedDate: z.string().nullable().optional(),
  vendor: z.string().min(1),
  cost: z.number().positive(),
  notes: z.string().min(1)
});

export const fuelCreateSchema = z.object({
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  liters: z.number().positive(),
  unitPrice: z.number().positive(),
  odometerKm: z.number().nonnegative(),
  refuelDate: z.string().min(1),
  station: z.string().min(1),
  status: z.enum(["draft", "submitted", "approved"])
});

export const expenseCreateSchema = z.object({
  category: z.enum(["fuel", "maintenance", "tolls", "insurance", "salaries", "other"]),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().min(1),
  status: z.enum(["draft", "submitted", "approved", "rejected"]),
  tripId: z.string().nullable().optional(),
  vehicleId: z.string().nullable().optional()
});
