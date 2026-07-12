# TransitOps Smart Transport Operations Platform

Authors: [shriyansh upadhyay](https://github.com/cse-ai-shriyansh/), [T prashant](https://github.com/prashant847), [vaibhav sharma](https://github.com/vaibhav9526), [ayush kumar patel](https://github.com/Ayushkumarpatel-AKP)

Architecture : [Architecture.md file](https://github.com/cse-ai-shriyansh/odoo-hackathon-2026-TransitOps/blob/main/ARCHITECTURE.md)

TransitOps is a contract-first transport operations workspace built with Next.js. It brings the core fleet workflow into one governed interface for vehicles, drivers, trips, maintenance, fuel, expenses, dashboard insights, and reporting.

## Product USP

- One workspace for the full transport lifecycle instead of fragmented spreadsheets and manual registers.
- Contract-first structure where the UI and API layer follow the same business rules.
- Built to enforce fleet constraints such as dispatch eligibility, status transitions, and role-based access.
- Organized like a real operations control center, not a static demo.
- Ready for a future production backend without changing the frontend contract.

## Problem Statement

- Replace spreadsheet-based fleet operations with a centralized digital platform.
- Support secure authentication and role-based access control.
- Manage vehicles, drivers, trips, maintenance, fuel logs, expenses, and reporting.
- Surface operational visibility through dashboard metrics and workflow state.

## Approach

- Frontend pages call local API routes in `frontend/app/api/`.
- Route handlers delegate business logic to shared services in `backend/`.
- Authentication, validation, and response formatting are centralized.
- Seeded/mock state is used now, with Supabase-compatible auth helpers in place for future persistence.
- The codebase is organized so the business rules stay reusable and easy to extend.

## Features

- Authentication with email, password, and role selection.
- Protected application shell and route access control.
- Dashboard with KPI cards, fleet map data, and chart payloads.
- Vehicle management with create, read, update, and delete actions.
- Driver management with create, read, update, and delete actions.
- Trip management with create, update, delete, dispatch, complete, and cancel actions.
- Maintenance tracking with record creation and completion handling.
- Fuel log capture with list and create workflows.
- Expense tracking with list and create workflows.
- Reports view for finance-oriented operational summaries.
- Search, filters, responsive navigation, and theme toggle in the workspace UI.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Query
- React Hook Form
- Zod
- Lucide React
- Leaflet and React Leaflet
- Next.js route handlers
- Shared backend services and repositories
- Supabase-compatible helpers
- Optional Redis cache for faster repository bootstrap and repeated reads

## Installation and Setup

- The runnable app lives in `frontend/`.

```powershell
cd frontend
npm install
```

- If needed, remove `node_modules` and any previous build output before reinstalling.

## Usage

- Start development mode:

```powershell
cd frontend
npm run dev
```

- Create a production build and start the app:

```powershell
cd frontend
npm run build
npm start
```

- `npm start` requires a successful build first.

## Project Structure

- `backend/` - shared backend logic, repositories, auth, validation, and response helpers.
- `Database/` - reference SQL schema files.
- `frontend/` - the Next.js application.
- `frontend/app/` - pages, layouts, and API routes.
- `frontend/components/` - UI, shell, theme, auth, and shared components.
- `frontend/docs/API_CONTRACT.md` - frontend/backend contract reference.
- `frontend/lib/` - API client helpers, mock data, utilities, and constants.
- `frontend/types/` - shared domain types.
- `context.md` - workspace summary and implementation notes.
- `TransitOps Smart Transport Operations Platform.pdf` - assignment brief.

## Assumptions and Limitations

- The current implementation uses mock or semi-mock state instead of a live database-backed backend.
- If Redis is configured with `REDIS_URL`, the backend caches the hydrated store snapshot and refreshes it on writes.
- The reports view is implemented, but CSV export is not exposed in the current UI.
- PDF export, email reminders, and vehicle document management are mentioned in the assignment but are not implemented in the solution files.
- The settings screen is local mock state and does not persist changes.
