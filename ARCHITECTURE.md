# TransitOps Architecture

## Overview

TransitOps is a Next.js-based smart transport operations platform. The application follows a thin-server, shared-contract architecture, where the frontend, API route handlers, and backend service layer are cleanly separated but co-located within a single Next.js application. This document describes the system architecture, request flow, and directory structure.

## High-Level Architecture

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
    Repositories -.->|future migration| Supabase
```

## Request Lifecycle

Every client-side data operation follows the same five-step path, keeping route handlers thin and business logic centralized.

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

## Response Envelope

All API responses follow a standardized JSON envelope, returned via the shared response helpers.

```mermaid
graph LR
    Response["API Response"] --> Success["Success<br/>{ success: true, data }"]
    Response --> Error["Error<br/>{ success: false, message, errors? }"]
```

## Authentication and Authorization Flow

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

## Implemented API Surface

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

## Data Model Normalization

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

## Directory Structure

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

## Frontend Composition

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

## Current State and Roadmap

| Layer | Current Implementation | Planned Migration |
|---|---|---|
| Persistence | Seeded in-memory state | Supabase / PostgreSQL |
| Auth | Cookie session + bearer token fallback, Supabase-aware helpers | Full Supabase-backed auth |
| API Contract | Fully implemented per `API_CONTRACT.md` | Stable; backend swap should not change contract |

## Orientation for New Contributors

For the fastest ramp-up on the codebase, review the following in order:

1. `frontend/docs/API_CONTRACT.md` — the source of truth for the API contract
2. `frontend/backend/services/` — the business logic layer
3. `frontend/app/api/` — the thin route handlers that expose the services
