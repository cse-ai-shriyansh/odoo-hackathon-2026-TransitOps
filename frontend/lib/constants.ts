import type { UserRole } from "@/types/domain";

export const APP_NAME = "TransitOps";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/drivers", label: "Drivers" },
  { href: "/trips", label: "Trips" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/fuel-logs", label: "Fuel Logs" },
  { href: "/expenses", label: "Expenses" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" }
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  fleet_manager: "Fleet Manager",
  dispatcher: "Dispatcher",
  safety_officer: "Safety Officer",
  financial_analyst: "Financial Analyst"
};
