# TransitOps Database Documentation

## Overview

TransitOps uses Supabase PostgreSQL with UUID primary keys, foreign
keys, indexes, triggers, and Row Level Security (RLS).

### Tables

  -----------------------------------------------------------------------
  Table                               Purpose
  ----------------------------------- -----------------------------------
  profiles                            User profiles linked to
                                      `auth.users` with application roles

  vehicles                            Fleet vehicle master data

  drivers                             Driver master data

  trips                               Trip scheduling and execution

  maintenance_logs                    Vehicle maintenance history

  fuel_logs                           Fuel transactions

  expenses                            Operational expense records
  -----------------------------------------------------------------------

## Relationships

-   `profiles.id` → `auth.users(id)`
-   `vehicles.created_by` → `profiles.id`
-   `drivers.created_by` → `profiles.id`
-   `trips.vehicle_id` → `vehicles.id`
-   `trips.driver_id` → `drivers.id`
-   `trips.dispatched_by` → `profiles.id`
-   `maintenance_logs.vehicle_id` → `vehicles.id`
-   `maintenance_logs.created_by` → `profiles.id`
-   `fuel_logs.vehicle_id` → `vehicles.id`
-   `fuel_logs.driver_id` → `drivers.id`
-   `fuel_logs.trip_id` → `trips.id`
-   `fuel_logs.created_by` → `profiles.id`
-   `expenses.vehicle_id` → `vehicles.id`
-   `expenses.driver_id` → `drivers.id`
-   `expenses.trip_id` → `trips.id`
-   `expenses.created_by` → `profiles.id`
-   `expenses.approved_by` → `profiles.id`

## User Roles

-   admin
-   fleet_manager
-   dispatcher
-   safety_officer
-   financial_analyst

## Vehicle Status Lifecycle

-   available
-   on_trip
-   in_shop
-   inactive
-   retired

## Driver Status (recommended lifecycle)

-   available
-   on_trip
-   on_leave
-   suspended
-   inactive
-   retired

## Business Modules

### Fleet

-   Vehicle registration
-   Vehicle lifecycle
-   Availability tracking

### Driver Management

-   Licensing
-   Employment details
-   Driver assignment

### Trip Management

-   Scheduling
-   Dispatching
-   Completion
-   Cancellation

### Maintenance

-   Preventive maintenance
-   Corrective maintenance
-   Service history

### Fuel

-   Fuel purchases
-   Consumption tracking

### Finance

-   Operational expenses
-   Cost reporting

## Security

-   Supabase Auth
-   `profiles` linked to `auth.users`
-   UUID primary keys
-   Foreign key integrity
-   CHECK constraints
-   UNIQUE constraints
-   RLS enabled on all tables
-   Timestamp auditing (`created_at`, `updated_at`)

## Planned Next Modules

1.  Authorization helper functions
2.  RLS policy refinement
3.  Business logic triggers
4.  Dashboard SQL views
5.  RPC functions
6.  Performance optimization

## Current Status

The core database schema is complete and ready for authentication
integration and application development.
