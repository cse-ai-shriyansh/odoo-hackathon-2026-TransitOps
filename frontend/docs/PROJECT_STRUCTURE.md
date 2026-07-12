# Project Structure

## Top-Level Layout
- `app/` - App Router entrypoints, layouts, and routes.
- `components/` - Shared UI, shell, auth, map, and utility components.
- `lib/` - API abstraction, mock services, constants, and query client.
- `types/` - Shared TypeScript domain types.
- `utils/` - Formatting and general helper utilities.
- `docs/` - Contract and implementation documentation.
- `Database/` - SQL seed files for the future backend.

## App Routes
- `/login` - authentication entry screen.
- `/dashboard` - KPI and fleet overview.
- `/vehicles` - vehicle CRUD.
- `/drivers` - driver CRUD.
- `/trips` - trip CRUD.
- `/maintenance` - maintenance CRUD.
- `/fuel-logs` - fuel log CRUD.
- `/expenses` - expense CRUD.
- `/reports` - report viewer.
- `/settings` - local workspace preferences.
- `404` - custom not-found screen.

## Layering Rules
- Pages call `lib/api/*` only.
- API modules call the mock layer only.
- Mock services are the only place that know about seeded data.
- UI components never import mock seed data directly.
