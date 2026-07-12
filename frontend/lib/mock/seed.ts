import { addDays, addHours, subDays } from "./time";
import type {
  AuthSession,
  DashboardPayload,
  Driver,
  Expense,
  FuelLog,
  MaintenanceRecord,
  Trip,
  Vehicle
} from "@/types/domain";

export const seededVehicles: Vehicle[] = [
  {
    id: "veh-100",
    plateNumber: "TX-4812",
    name: "Atlas 12T",
    type: "Cargo Truck",
    status: "available",
    driverId: null,
    capacityKg: 12000,
    odometerKm: 83124,
    fuelLevel: 78,
    lastServiceDate: subDays(new Date(), 18).toISOString(),
    destination: "North Distribution Center",
    eta: addHours(new Date(), 6).toISOString(),
    location: { lat: 40.7128, lng: -74.006 }
  },
  {
    id: "veh-101",
    plateNumber: "TX-9930",
    name: "Boreal Reefer",
    type: "Refrigerated Truck",
    status: "active_trip",
    driverId: "drv-201",
    capacityKg: 16000,
    odometerKm: 146873,
    fuelLevel: 51,
    lastServiceDate: subDays(new Date(), 28).toISOString(),
    destination: "Harbor Warehouse 8",
    eta: addHours(new Date(), 2).toISOString(),
    location: { lat: 40.7484, lng: -73.9857 }
  },
  {
    id: "veh-102",
    plateNumber: "TX-2204",
    name: "Cinder Van",
    type: "Sprinter Van",
    status: "in_shop",
    driverId: null,
    capacityKg: 3200,
    odometerKm: 60431,
    fuelLevel: 24,
    lastServiceDate: subDays(new Date(), 6).toISOString(),
    destination: "Central Service Bay",
    eta: addDays(new Date(), 1).toISOString(),
    location: { lat: 40.7306, lng: -73.9352 }
  },
  {
    id: "veh-103",
    plateNumber: "TX-4408",
    name: "Delta Heavy",
    type: "Flatbed",
    status: "retired",
    driverId: null,
    capacityKg: 18000,
    odometerKm: 211902,
    fuelLevel: 0,
    lastServiceDate: subDays(new Date(), 113).toISOString(),
    destination: "Fleet Archive",
    eta: addDays(new Date(), 30).toISOString(),
    location: { lat: 40.758, lng: -73.9855 }
  },
  {
    id: "veh-104",
    plateNumber: "TX-7741",
    name: "Echo Hauler",
    type: "Box Truck",
    status: "available",
    driverId: null,
    capacityKg: 10500,
    odometerKm: 93312,
    fuelLevel: 68,
    lastServiceDate: subDays(new Date(), 14).toISOString(),
    destination: "East Retail Hub",
    eta: addHours(new Date(), 8).toISOString(),
    location: { lat: 40.706, lng: -74.017 }
  }
];

export const seededDrivers: Driver[] = [
  {
    id: "drv-200",
    name: "Alicia Morgan",
    phone: "+1 (555) 014-8841",
    email: "alicia.morgan@transitops.test",
    role: "Driver Lead",
    status: "available",
    licenseNumber: "D-8182031",
    licenseExpiry: addDays(new Date(), 220).toISOString(),
    assignedVehicleId: null,
    homeBase: "North Hub"
  },
  {
    id: "drv-201",
    name: "Jordan Park",
    phone: "+1 (555) 018-6638",
    email: "jordan.park@transitops.test",
    role: "Driver",
    status: "assigned",
    licenseNumber: "D-7261442",
    licenseExpiry: addDays(new Date(), 120).toISOString(),
    assignedVehicleId: "veh-101",
    homeBase: "Harbor Depot"
  },
  {
    id: "drv-202",
    name: "Samantha Reed",
    phone: "+1 (555) 015-3208",
    email: "samantha.reed@transitops.test",
    role: "Driver",
    status: "suspended",
    licenseNumber: "D-1820021",
    licenseExpiry: addDays(new Date(), 40).toISOString(),
    assignedVehicleId: null,
    homeBase: "Central Garage"
  },
  {
    id: "drv-203",
    name: "Marcus Lee",
    phone: "+1 (555) 017-4042",
    email: "marcus.lee@transitops.test",
    role: "Driver",
    status: "available",
    licenseNumber: "D-1129022",
    licenseExpiry: subDays(new Date(), 3).toISOString(),
    assignedVehicleId: null,
    homeBase: "South Relay"
  }
];

export const seededTrips: Trip[] = [
  {
    id: "trip-300",
    reference: "TR-2026-0192",
    status: "active",
    origin: "North Distribution Center",
    destination: "Harbor Warehouse 8",
    cargoDescription: "Pharmaceutical cartons",
    cargoWeightKg: 8200,
    vehicleId: "veh-101",
    driverId: "drv-201",
    plannedDeparture: new Date().toISOString(),
    plannedArrival: addHours(new Date(), 2).toISOString(),
    notes: "Temperature-sensitive cargo."
  },
  {
    id: "trip-301",
    reference: "TR-2026-0193",
    status: "pending",
    origin: "Central Depot",
    destination: "East Retail Hub",
    cargoDescription: "Mixed retail inventory",
    cargoWeightKg: 5100,
    vehicleId: "veh-100",
    driverId: "drv-200",
    plannedDeparture: addHours(new Date(), 4).toISOString(),
    plannedArrival: addHours(new Date(), 10).toISOString(),
    notes: "Awaiting dispatch approval."
  },
  {
    id: "trip-302",
    reference: "TR-2026-0194",
    status: "completed",
    origin: "West Yard",
    destination: "Airport Cargo Terminal",
    cargoDescription: "Electronics pallets",
    cargoWeightKg: 10400,
    vehicleId: "veh-104",
    driverId: "drv-203",
    plannedDeparture: subDays(new Date(), 3).toISOString(),
    plannedArrival: subDays(new Date(), 2).toISOString(),
    notes: "Delivered on schedule."
  }
];

export const seededMaintenance: MaintenanceRecord[] = [
  {
    id: "mnt-400",
    vehicleId: "veh-102",
    type: "Engine inspection",
    status: "in_progress",
    scheduledDate: subDays(new Date(), 1).toISOString(),
    completedDate: null,
    vendor: "Metro Fleet Services",
    cost: 1840,
    notes: "Investigating coolant leak."
  },
  {
    id: "mnt-401",
    vehicleId: "veh-100",
    type: "Brake service",
    status: "scheduled",
    scheduledDate: addDays(new Date(), 5).toISOString(),
    completedDate: null,
    vendor: "North Auto Care",
    cost: 620,
    notes: "Replace pads and resurface rotors."
  },
  {
    id: "mnt-402",
    vehicleId: "veh-101",
    type: "Trailer refrigeration check",
    status: "completed",
    scheduledDate: subDays(new Date(), 12).toISOString(),
    completedDate: subDays(new Date(), 11).toISOString(),
    vendor: "Arctic Diagnostics",
    cost: 970,
    notes: "Compressor recalibrated."
  }
];

export const seededFuelLogs: FuelLog[] = [
  {
    id: "fuel-500",
    vehicleId: "veh-101",
    driverId: "drv-201",
    liters: 98,
    unitPrice: 1.32,
    totalCost: 129,
    odometerKm: 146700,
    refuelDate: subDays(new Date(), 1).toISOString(),
    station: "Harbor Fuel Center",
    status: "approved"
  },
  {
    id: "fuel-501",
    vehicleId: "veh-100",
    driverId: "drv-200",
    liters: 74,
    unitPrice: 1.29,
    totalCost: 95,
    odometerKm: 82990,
    refuelDate: subDays(new Date(), 2).toISOString(),
    station: "Metro Service Fuel",
    status: "submitted"
  },
  {
    id: "fuel-502",
    vehicleId: "veh-104",
    driverId: "drv-203",
    liters: 88,
    unitPrice: 1.25,
    totalCost: 110,
    odometerKm: 93210,
    refuelDate: subDays(new Date(), 3).toISOString(),
    station: "Eastside Petroleum",
    status: "approved"
  }
];

export const seededExpenses: Expense[] = [
  {
    id: "exp-600",
    category: "fuel",
    description: "Fuel reimbursement for regional delivery",
    amount: 129,
    date: subDays(new Date(), 1).toISOString(),
    status: "approved",
    tripId: "trip-300",
    vehicleId: "veh-101"
  },
  {
    id: "exp-601",
    category: "maintenance",
    description: "Brake replacement parts",
    amount: 620,
    date: subDays(new Date(), 5).toISOString(),
    status: "submitted",
    tripId: null,
    vehicleId: "veh-100"
  },
  {
    id: "exp-602",
    category: "tolls",
    description: "Highway tolls for airport lane",
    amount: 43,
    date: subDays(new Date(), 2).toISOString(),
    status: "draft",
    tripId: "trip-302",
    vehicleId: "veh-104"
  }
];

export const seededAuthSession: AuthSession = {
  accessToken: "mock-access-token-transitops",
  user: {
    id: "usr-1",
    name: "Dana Holt",
    email: "dana.holt@transitops.test",
    role: "admin"
  },
  expiresAt: addDays(new Date(), 1).toISOString()
};

export const dashboardPayload: DashboardPayload = {
  kpis: {
    activeVehicles: 2,
    availableVehicles: 2,
    vehiclesInShop: 1,
    activeTrips: 1,
    pendingTrips: 1,
    driversAvailable: 2,
    fleetUtilization: 62,
    operationalCost: 24860
  },
  tripStatus: [
    { label: "Active", value: 1 },
    { label: "Pending", value: 1 },
    { label: "Completed", value: 1 },
    { label: "Cancelled", value: 0 }
  ],
  vehicleUtilization: [
    { label: "Available", value: 2 },
    { label: "Active", value: 2 },
    { label: "In Shop", value: 1 },
    { label: "Retired", value: 1 }
  ],
  fuelConsumption: [
    { label: "Mon", value: 430 },
    { label: "Tue", value: 520 },
    { label: "Wed", value: 470 },
    { label: "Thu", value: 600 },
    { label: "Fri", value: 540 },
    { label: "Sat", value: 390 },
    { label: "Sun", value: 350 }
  ],
  maintenanceTrend: [
    { label: "Jan", value: 8 },
    { label: "Feb", value: 10 },
    { label: "Mar", value: 6 },
    { label: "Apr", value: 12 },
    { label: "May", value: 9 },
    { label: "Jun", value: 13 }
  ],
  expenseBreakdown: [
    { label: "Fuel", value: 12500 },
    { label: "Maintenance", value: 5700 },
    { label: "Tolls", value: 2100 },
    { label: "Insurance", value: 3000 },
    { label: "Other", value: 1560 }
  ],
  fleetMap: seededVehicles.map((vehicle, index) => ({
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    driverName:
      seededDrivers.find((driver) => driver.id === vehicle.driverId)?.name ??
      ["Alicia Morgan", "Jordan Park", "Samantha Reed", "Marcus Lee", "Tyler Brooks"][index],
    status: vehicle.status,
    destination: vehicle.destination,
    eta: vehicle.eta,
    position: vehicle.location
  }))
};
