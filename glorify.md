# TransitOps System Architecture

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Technology Stack](#technology-stack)
- [Part I — Application Architecture](#part-i--application-architecture)
  - [High-Level Architecture](#high-level-architecture)
  - [Request Lifecycle](#request-lifecycle)
  - [Response Envelope](#response-envelope)
  - [Authentication and Authorization Flow](#authentication-and-authorization-flow)
  - [Implemented API Surface](#implemented-api-surface)
  - [Data Model Normalization](#data-model-normalization)
  - [Directory Structure](#directory-structure)
  - [Frontend Composition](#frontend-composition)
- [Part II — Database Architecture](#part-ii--database-architecture)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
  - [Tables](#tables)
  - [Relationships](#relationships)
  - [User Roles](#user-roles)
  - [Lifecycle States](#lifecycle-states)
  - [Business Modules](#business-modules)
  - [Security Model](#security-model)
  - [Database Roadmap](#database-roadmap)
- [Current State and Roadmap](#current-state-and-roadmap)
- [Known Limitations](#known-limitations)
- [Orientation for New Contributors](#orientation-for-new-contributors)

## Overview

TransitOps is a contract-first smart transport operations platform built with Next.js. It brings the full fleet workflow — vehicles, drivers, trips, maintenance, fuel, expenses, dashboard insights, and reporting — into a single governed workspace. The system follows a thin-server, shared-contract architecture, where the frontend, API route handlers, and backend service layer are cleanly separated but co-located within one Next.js application, and enforces fleet business rules such as dispatch eligibility, status transitions, and role-based access at the service layer rather than in the UI.

This document is the single source of truth for the system's architecture: how the application is structured and how it behaves at runtime (Part I), and the relational data model it is designed to run against (Part II).

## Design Principles

- **Contract-first**: the UI and API layer are built against the same explicit contract (`frontend/docs/API_CONTRACT.md`), so either side can evolve independently as long as the contract holds.
- **Thin routes, thick services**: route handlers do no business logic of their own; they validate transport concerns and delegate everything else to `backend/services`.
- **Persistence-agnostic core**: business logic is written against repository interfaces, not a specific datastore, so the current seeded in-memory store can be swapped for Supabase/PostgreSQL without touching services or the frontend contract.
- **Centralized cross-cutting concerns**: authentication, validation, and response formatting are implemented once and reused across every route.
- **Database-enforced integrity**: the data model is designed so that referential integrity, role access, and auditing are guaranteed at the database layer, not only in application code.

## Technology Stack

| Layer | Technologies |
|---|---|
| Framework | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Data fetching / state | React Query |
| Forms and validation | React Hook Form, Zod |
| UI primitives | Lucide React |
| Mapping | Leaflet, React Leaflet |
| API layer | Next.js Route Handlers |
| Backend logic | Shared services and repositories (`frontend/backend`) |
| Auth | Supabase Auth, Supabase-compatible auth helpers |
| Caching (optional) | Redis, for repository bootstrap and repeated reads |
| Planned persistence | Supabase / PostgreSQL |

---

## Part I — Application Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        UI["React UI Components<br/>(frontend/components)"]
        Pages["App Router Pages<br/>(frontend/app)"]
        APIClient["Frontend API Abstraction<br/>(frontend/lib/api)"]
    end

    subgraph Server["Server Layer (Next.js Route Handlers)"]
        Routes["API Routes<br/>(frontend/app/api)"]
    end

    subgraph Backend["Backend Layer (frontend/backend)"]
        Services["Services<br/>(business logic)"]
        Repositories["Repositories<br/>(data access)"]
        Validation["Validation Helpers"]
        Auth["Auth Helpers"]
        ResponseHelpers["Response Helpers<br/>(JSON envelope)"]
    end

    subgraph Data["Data Layer"]
        Mock["Seeded In-Memory State<br/>(current)"]
        Redis["Redis Cache<br/>(optional, REDIS_URL)"]
        Supabase["Supabase / PostgreSQL<br/>(planned)"]
    end

    UI --> Pages
    Pages --> APIClient
    APIClient -->|HTTP request| Routes
    Routes --> Services
    Services --> Repositories
    Services --> Validation
    Services --> Auth
    Services --> ResponseHelpers
    Repositories --> Mock
    Repositories -.->|hydrated snapshot, refreshed on writes| Redis
    Repositories -.->|future migration| Supabase
```

### Request Lifecycle

Every client-side data operation follows the same path, keeping route handlers thin and business logic centralized.

```mermaid
sequenceDiagram
    participant U as React Component
    participant A as lib/api (frontend)
    participant R as app/api Route Handler
    participant S as backend/services
    participant Rp as backend/repositories

    U->>A: call API abstraction function
    A->>R: HTTP request (fetch)
    R->>S: delegate to service
    S->>S: validate input, check auth/role
    S->>Rp: read/write data
    Rp-->>S: entity data
    S-->>R: normalized result
    R-->>A: JSON envelope response
    A-->>U: typed data or error
```

### Response Envelope

All API responses follow a standardized JSON envelope, returned via the shared response helpers.

```mermaid
graph LR
    Response["API Response"] --> Success["Success<br/>{ success: true, data }"]
    Response --> Error["Error<br/>{ success: false, message, errors? }"]
```

### Authentication and Authorization Flow

```mermaid
graph TB
    Request["Incoming Request"] --> CheckCookie{"Session cookie present?"}
    CheckCookie -->|Yes| BootstrapSession["Bootstrap session from cookie"]
    CheckCookie -->|No| CheckBearer{"Bearer token present?"}
    CheckBearer -->|Yes| BootstrapToken["Authenticate via bearer token"]
    CheckBearer -->|No| Unauthorized["401 Unauthorized"]

    BootstrapSession --> RoleCheck["Role-based authorization check"]
    BootstrapToken --> RoleCheck

    RoleCheck --> Roles["admin / fleet_manager / dispatcher /<br/>safety_officer / financial_analyst"]
    Roles --> Allow["Proceed to service logic"]
    Roles --> Deny["403 Forbidden"]
```

### Implemented API Surface

```mermaid
graph LR
    subgraph Auth["Auth"]
        A1["GET/POST /auth/session"]
        A2["POST /auth/logout"]
    end

    subgraph Core["Fleet Operations"]
        V["GET/POST /vehicles<br/>PATCH/DELETE /vehicles/{id}"]
        D["GET/POST /drivers<br/>PATCH/DELETE /drivers/{id}"]
        T["GET/POST /trips<br/>PATCH/DELETE /trips/{id}<br/>dispatch / complete / cancel"]
    end

    subgraph Ops["Maintenance & Finance"]
        M["GET/POST /maintenance<br/>PATCH/DELETE /maintenance/{id}<br/>complete"]
        F["GET/POST /fuel"]
        E["GET/POST /expenses"]
    end

    subgraph Insights["Insights"]
        Dash["GET /dashboard"]
        Rep["GET /reports"]
    end
```

### Data Model Normalization

The frontend contract and the underlying SQL schema are not identical in shape. The service layer is responsible for reconciling the two.

```mermaid
graph TB
    SQL["Database/ SQL Schema"] --> Service["backend/services<br/>(normalization layer)"]
    Contract["frontend/docs/API_CONTRACT.md"] --> Service
    Service --> Normalized["Normalized Domain Objects"]

    Normalized --> N1["Nullable foreign keys → explicit null"]
    Normalized --> N2["Trip dispatch/complete → updates linked vehicle and driver state"]
    Normalized --> N3["Maintenance complete → vehicle returns to available"]
    Normalized --> N4["Fuel/expense records → derived values validated in service layer"]
```

### Directory Structure

```mermaid
graph TB
    Root["TransitOps/"] --> Frontend["frontend/"]
    Root --> DB["Database/<br/>(reference SQL schema)"]

    Frontend --> App["app/<br/>pages + API routes"]
    Frontend --> BackendDir["backend/<br/>auth, validation, repositories, services, response helpers"]
    Frontend --> Lib["lib/api/<br/>frontend API abstraction"]
    Frontend --> Components["components/<br/>shared UI, shell, auth, theme, map"]
    Frontend --> Types["types/<br/>shared domain types"]
    Frontend --> Docs["docs/API_CONTRACT.md<br/>frontend/backend contract source"]
```

### Frontend Composition

```mermaid
graph TB
    Shell["Protected Shell + Session Provider"] --> Dashboard["Dashboard<br/>(map via client-only dynamic import)"]
    Shell --> Fleet["Fleet"]
    Shell --> Trips["Trips"]
    Shell --> Drivers["Drivers"]
    Shell --> Maintenance["Maintenance"]
    Shell --> Fuel["Fuel"]
    Shell --> Expenses["Expenses"]
    Shell --> Reports["Reports"]
    Shell --> Settings["Settings"]
```

Notes:
- The dashboard map is loaded via a client-only dynamic import so that Leaflet, which depends on browser globals, does not break server-side rendering.
- The visual design system is intentionally monochrome, minimal, and free of gradients.

---

## Part II — Database Architecture

TransitOps is designed against a Supabase PostgreSQL schema. The data model uses UUID primary keys throughout, enforces referential integrity with foreign keys, and is built for production-grade operation with indexes, triggers, and Row Level Security (RLS).

### Entity Relationship Diagram

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "has profile"
    PROFILES ||--o{ VEHICLES : creates
    PROFILES ||--o{ DRIVERS : creates
    PROFILES ||--o{ TRIPS : dispatches
    PROFILES ||--o{ MAINTENANCE_LOGS : creates
    PROFILES ||--o{ FUEL_LOGS : creates
    PROFILES ||--o{ EXPENSES : "creates / approves"

    VEHICLES ||--o{ TRIPS : "assigned to"
    DRIVERS ||--o{ TRIPS : "assigned to"

    VEHICLES ||--o{ MAINTENANCE_LOGS : "serviced in"

    VEHICLES ||--o{ FUEL_LOGS : "refueled in"
    DRIVERS ||--o{ FUEL_LOGS : "logged by"
    TRIPS ||--o{ FUEL_LOGS : "associated with"

    VEHICLES ||--o{ EXPENSES : "incurs"
    DRIVERS ||--o{ EXPENSES : "incurs"
    TRIPS ||--o{ EXPENSES : "incurs"

    AUTH_USERS {
        uuid id PK
    }

    PROFILES {
        uuid id PK
        uuid user_id FK
        text role
        timestamp created_at
        timestamp updated_at
    }

    VEHICLES {
        uuid id PK
        uuid created_by FK
        text status
        timestamp created_at
        timestamp updated_at
    }

    DRIVERS {
        uuid id PK
        uuid created_by FK
        text status
        timestamp created_at
        timestamp updated_at
    }

    TRIPS {
        uuid id PK
        uuid vehicle_id FK
        uuid driver_id FK
        uuid dispatched_by FK
        text status
        timestamp created_at
        timestamp updated_at
    }

    MAINTENANCE_LOGS {
        uuid id PK
        uuid vehicle_id FK
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    FUEL_LOGS {
        uuid id PK
        uuid vehicle_id FK
        uuid driver_id FK
        uuid trip_id FK
        uuid created_by FK
        timestamp created_at
    }

    EXPENSES {
        uuid id PK
        uuid vehicle_id FK
        uuid driver_id FK
        uuid trip_id FK
        uuid created_by FK
        uuid approved_by FK
        timestamp created_at
    }
```

### Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles linked to `auth.users`, carrying the application-level role |
| `vehicles` | Fleet vehicle master data |
| `drivers` | Driver master data |
| `trips` | Trip scheduling and execution |
| `maintenance_logs` | Vehicle maintenance history |
| `fuel_logs` | Fuel transactions |
| `expenses` | Operational expense records |

### Relationships

| Foreign Key | References |
|---|---|
| `profiles.id` | `auth.users(id)` |
| `vehicles.created_by` | `profiles.id` |
| `drivers.created_by` | `profiles.id` |
| `trips.vehicle_id` | `vehicles.id` |
| `trips.driver_id` | `drivers.id` |
| `trips.dispatched_by` | `profiles.id` |
| `maintenance_logs.vehicle_id` | `vehicles.id` |
| `maintenance_logs.created_by` | `profiles.id` |
| `fuel_logs.vehicle_id` | `vehicles.id` |
| `fuel_logs.driver_id` | `drivers.id` |
| `fuel_logs.trip_id` | `trips.id` |
| `fuel_logs.created_by` | `profiles.id` |
| `expenses.vehicle_id` | `vehicles.id` |
| `expenses.driver_id` | `drivers.id` |
| `expenses.trip_id` | `trips.id` |
| `expenses.created_by` | `profiles.id` |
| `expenses.approved_by` | `profiles.id` |

### User Roles

Access control is role-based, with the following roles defined in `profiles` and enforced consistently across both the application service layer and the database RLS policies:

- `admin`
- `fleet_manager`
- `dispatcher`
- `safety_officer`
- `financial_analyst`

### Lifecycle States

**Vehicle Status**

```mermaid
stateDiagram-v2
    [*] --> available
    available --> on_trip
    on_trip --> available
    available --> in_shop
    in_shop --> available
    available --> inactive
    inactive --> available
    inactive --> retired
    in_shop --> retired
    retired --> [*]
```

**Driver Status** (recommended lifecycle)

```mermaid
stateDiagram-v2
    [*] --> available
    available --> on_trip
    on_trip --> available
    available --> on_leave
    on_leave --> available
    available --> suspended
    suspended --> available
    available --> inactive
    inactive --> retired
    retired --> [*]
```

### Business Modules

| Module | Responsibilities |
|---|---|
| Fleet | Vehicle registration, vehicle lifecycle, availability tracking |
| Driver Management | Licensing, employment details, driver assignment |
| Trip Management | Scheduling, dispatching, completion, cancellation |
| Maintenance | Preventive maintenance, corrective maintenance, service history |
| Fuel | Fuel purchases, consumption tracking |
| Finance | Operational expenses, cost reporting |

### Security Model

```mermaid
graph TB
    Auth["Supabase Auth"] --> Profiles["profiles table<br/>linked to auth.users"]
    Profiles --> Roles["Role assignment<br/>admin / fleet_manager / dispatcher /<br/>safety_officer / financial_analyst"]

    Integrity["Data Integrity"] --> UUIDKeys["UUID primary keys"]
    Integrity --> FK["Foreign key integrity"]
    Integrity --> Check["CHECK constraints"]
    Integrity --> Unique["UNIQUE constraints"]

    Access["Access Control"] --> RLS["Row Level Security<br/>enabled on all tables"]

    Audit["Auditing"] --> Timestamps["created_at / updated_at<br/>on every table"]
```

Summary:

- Authentication is handled by Supabase Auth, with `profiles` linked one-to-one to `auth.users`.
- Every table uses UUID primary keys and enforces foreign key integrity.
- CHECK and UNIQUE constraints guard data validity at the database level.
- Row Level Security is enabled on all tables, so access is enforced at the database layer, not only in application code.
- All tables carry `created_at` and `updated_at` for timestamp auditing.

### Database Roadmap

| Order | Item |
|---|---|
| 1 | Authorization helper functions |
| 2 | RLS policy refinement |
| 3 | Business logic triggers |
| 4 | Dashboard SQL views |
| 5 | RPC functions |
| 6 | Performance optimization |

---

## Current State and Roadmap

| Layer | Current Implementation | Planned Migration |
|---|---|---|
| Persistence | Seeded in-memory state, optionally cached in Redis | Supabase / PostgreSQL |
| Auth | Cookie session + bearer token fallback, Supabase-aware helpers | Full Supabase-backed auth |
| API Contract | Fully implemented per `API_CONTRACT.md` | Stable; backend swap should not change contract |
| Database Schema | Complete: tables, relationships, indexes, triggers, RLS defined | Ready for authentication integration and application development |

## Known Limitations

- Persistence is currently mock or semi-mock rather than a live database-backed store.
- The reports view is implemented, but CSV export is not yet exposed in the UI.
- PDF export, email reminders, and vehicle document management are described in the assignment brief but not yet implemented.
- The settings screen holds local mock state and does not persist changes.

## Orientation for New Contributors

For the fastest ramp-up on the codebase, review the following in order:

1. `frontend/docs/API_CONTRACT.md` — the source of truth for the API contract
2. `frontend/backend/services/` — the business logic layer
3. `frontend/app/api/` — the thin route handlers that expose the services
4. Part II of this document — the underlying relational data model
