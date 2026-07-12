# Backend Tasks

## Required Endpoints
- Auth session bootstrap and login flow.
- Fleet dashboard aggregate endpoint.
- Vehicles list/create/update/delete.
- Drivers list/create/update/delete.
- Trips list/create/update/delete.
- Maintenance list/create/update/delete.
- Fuel logs list/create/update/delete.
- Expenses list/create/update/delete.
- Reports summary endpoint.

## Cross-Cutting Requirements
- Match the frontend response shapes exactly.
- Enforce business rules on the backend as well as in the UI.
- Preserve role-aware authorization for each endpoint.
- Support Supabase-compatible auth semantics when the real backend arrives.
- Keep field names and nullability stable so the UI does not need refactoring.

## Suggested Implementation Order
1. Auth session and role claims.
2. Read endpoints for dashboard and each resource.
3. Write endpoints for CRUD operations.
4. Business-rule validations and error payload standardization.
5. Reporting aggregation.
