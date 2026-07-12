# TransitOps Workspace Context

## Overview

TransitOps is a Next.js-based smart transport operations platform. The UI lives in `frontend/`, and the app now includes a working backend contract implemented as Next.js route handlers. The backend logic is organized in a dedicated `frontend/backend/` folder so the route handlers stay thin and the shared business rules are easy to reuse.

## Workspace Layout

- `frontend/` - main Next.js application
- `frontend/app/` - app router pages and API routes
- `frontend/backend/` - reusable backend implementation for auth, validation, repositories, services, and response helpers
- `frontend/lib/api/` - frontend API abstraction used by the React app
- `frontend/components/` - shared UI, shell, auth, theme, and map components
- `frontend/types/` - shared domain types
- `frontend/docs/API_CONTRACT.md` - frontend/backend contract source
- `Database/` - reference SQL schema files for the real data model

## Current Architecture

The app uses a thin-server, shared-contract model:

1. The frontend calls `frontend/lib/api/*`.
2. Those helpers hit `frontend/app/api/*` route handlers.
3. Route handlers delegate into `frontend/backend/services/*`.
4. Services use repositories, validation, and auth helpers from `frontend/backend/`.
5. The backend currently uses seeded/mock state but is structured to swap to Supabase/PostgreSQL-backed persistence.

The response format is standardized as a JSON envelope:

- success: `{ success: true, data }`
- error: `{ success: false, message, errors? }`

## Implemented Backend Surface

The contract covered by `frontend/docs/API_CONTRACT.md` is implemented for:

- `GET /auth/session`
- `POST /auth/session`
- `POST /auth/logout`
- `GET /dashboard`
- `GET|POST /vehicles`
- `PATCH|DELETE /vehicles/{id}`
- `GET|POST /drivers`
- `PATCH|DELETE /drivers/{id}`
- `GET|POST /trips`
- `PATCH|DELETE /trips/{id}`
- `PATCH /trips/{id}/dispatch`
- `PATCH /trips/{id}/complete`
- `PATCH /trips/{id}/cancel`
- `GET|POST /maintenance`
- `PATCH|DELETE /maintenance/{id}`
- `PATCH /maintenance/{id}/complete`
- `GET|POST /fuel`
- `GET|POST /expenses`
- `GET /reports`

## Data Model Notes

The frontend contract and the SQL schema are not identical in shape, so the backend service layer normalizes and maps fields where needed.

- Nullable foreign keys are normalized to explicit `null` values.
- Trip dispatch and completion update linked vehicle and driver state.
- Maintenance completion returns vehicles to `available` when appropriate.
- Fuel and expense records compute or validate derived values in the service layer.

## Authentication and Access Control

Session handling supports:

- cookie-based session bootstrap
- bearer-token fallback for request auth
- role-based authorization checks in services

Supported roles are:

- `admin`
- `fleet_manager`
- `dispatcher`
- `safety_officer`
- `financial_analyst`

## Frontend State

The UI is already built and working. Key areas:

- Dashboard, fleet, trips, drivers, maintenance, fuel, expenses, reports, and settings pages exist.
- The app uses a protected shell and session provider.
- The dashboard map uses client-only dynamic import so Leaflet does not break server rendering.
- The visual style is intentionally monochrome, minimal, and gradient-free.

## Important Fixes Already Applied

- The dashboard 500 error was caused by a server-side code path using `window.setTimeout` in the shared mock delay helper. It has been changed to `globalThis.setTimeout`.
- The backend implementation was moved into `frontend/backend/` so Next can resolve the imports cleanly.
- The app now builds successfully after the backend restructure.

## Validation Status

Verified command:

```powershell
Set-Location 'D:\Odoo Hackathon 2026\frontend'; npm run build
```

Result: build passes successfully.

Browser verification:

- `/dashboard` now loads and renders the dashboard instead of showing an internal server error.

## Notes For Future Work

- The backend currently uses seeded in-memory state and Supabase-aware auth helpers; swapping persistence to real Supabase/PostgreSQL tables is the next major integration step.
- If a teammate needs the fastest orientation, start with `frontend/docs/API_CONTRACT.md`, then `frontend/backend/services/`, then `frontend/app/api/`.
