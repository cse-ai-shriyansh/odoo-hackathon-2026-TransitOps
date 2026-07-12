# TransitOps API Contract

This document defines the backend contract the frontend already consumes through `lib/api/*`. The mock layer must stay shape-compatible with the future implementation.

## Authentication

### `GET /auth/session`
- Purpose: fetch the current session.
- Authentication: none for mock bootstrap; future backend should read cookies or bearer tokens.
- Role permissions: all authenticated roles.
- Request body: none.
- Response body:
```json
{
  "accessToken": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "admin"
  },
  "expiresAt": "string"
}
```
- Validation rules: session must include a supported role.
- Possible errors: `401 UNAUTHORIZED`, `404 NOT_FOUND`.

### `POST /auth/session`
- Purpose: sign in with mock or future Supabase-compatible auth.
- Authentication: none.
- Role permissions: all roles.
- Request body:
```json
{ "email": "string", "password": "string", "role": "admin" }
```
- Response body: same as `GET /auth/session`.
- Validation rules: email required, password required, role must be supported.
- Possible errors: `422 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`.

### `POST /auth/logout`
- Purpose: terminate the active session.
- Authentication: bearer token or cookie session.
- Role permissions: all roles.
- Request body: none.
- Response body:
```json
{ "success": true }
```
- Possible errors: `401 UNAUTHORIZED`.

## Dashboard

### `GET /dashboard`
- Purpose: fetch KPI cards, chart series, and fleet map points.
- Authentication: required.
- Role permissions: all authenticated roles.
- Request body: none.
- Response body: `DashboardPayload` containing `kpis`, `tripStatus`, `vehicleUtilization`, `fuelConsumption`, `maintenanceTrend`, `expenseBreakdown`, and `fleetMap`.
- Validation rules: numeric values must be non-negative.
- Possible errors: `401 UNAUTHORIZED`.

## Vehicles

### `GET /vehicles`
- Purpose: list fleet vehicles.
- Authentication: required.
- Role permissions: admin, fleet manager, dispatcher, safety officer, financial analyst.
- Request body: none.
- Response body: array of vehicle records.
- Validation rules: none.
- Possible errors: `401`, `403`.

### `POST /vehicles`
- Purpose: create a vehicle.
- Authentication: required.
- Role permissions: admin, fleet manager.
- Request body: `Vehicle` without `id`.
- Response body: created vehicle.
- Validation rules: plate number required, capacity must be positive.
- Possible errors: `422`, `409`, `403`.

### `PATCH /vehicles/{id}`
- Purpose: update a vehicle.
- Authentication: required.
- Role permissions: admin, fleet manager.
- Request body: partial vehicle fields.
- Response body: updated vehicle.
- Validation rules: retired vehicles cannot be dispatched; in-shop vehicles cannot be selected for trips.
- Possible errors: `404`, `409`, `422`.

### `DELETE /vehicles/{id}`
- Purpose: delete a vehicle.
- Authentication: required.
- Role permissions: admin.
- Request body: none.
- Response body: `{ "success": true }`.
- Possible errors: `404`, `409`.

## Drivers

### `GET /drivers`
- Purpose: list drivers.
- Authentication: required.
- Role permissions: all authenticated roles.
- Request body: none.
- Response body: array of driver records.
- Validation rules: none.
- Possible errors: `401`.

### `POST /drivers`
- Purpose: create a driver.
- Authentication: required.
- Role permissions: admin, fleet manager.
- Request body: `Driver` without `id`.
- Response body: created driver.
- Validation rules: name and email required.
- Possible errors: `422`, `409`.

### `PATCH /drivers/{id}`
- Purpose: update a driver.
- Authentication: required.
- Role permissions: admin, fleet manager, dispatcher.
- Request body: partial driver fields.
- Response body: updated driver.
- Validation rules: suspended drivers cannot be assigned; expired licenses cannot be assigned.
- Possible errors: `404`, `409`, `422`.

### `DELETE /drivers/{id}`
- Purpose: delete a driver.
- Authentication: required.
- Role permissions: admin.
- Request body: none.
- Response body: `{ "success": true }`.
- Possible errors: `404`, `409`.

## Trips

### `GET /trips`
- Purpose: list trips.
- Authentication: required.
- Role permissions: admin, fleet manager, dispatcher.
- Request body: none.
- Response body: array of trip records.
- Validation rules: none.
- Possible errors: `401`, `403`.

### `POST /trips`
- Purpose: create a trip.
- Authentication: required.
- Role permissions: admin, fleet manager, dispatcher.
- Request body: `Trip` without `id`.
- Response body: created trip.
- Validation rules: cargo weight must be positive, vehicle and driver must exist and be eligible.
- Possible errors: `422`, `409`.

### `PATCH /trips/{id}`
- Purpose: update a trip.
- Authentication: required.
- Role permissions: admin, fleet manager, dispatcher.
- Request body: partial trip fields.
- Response body: updated trip.
- Validation rules: active trip cannot be assigned to another vehicle without release.
- Possible errors: `404`, `409`, `422`.

### `DELETE /trips/{id}`
- Purpose: delete a trip.
- Authentication: required.
- Role permissions: admin, fleet manager.
- Request body: none.
- Response body: `{ "success": true }`.
- Possible errors: `404`, `409`.

## Maintenance

### `GET /maintenance`
- Purpose: list maintenance logs.
- Authentication: required.
- Role permissions: all authenticated roles.
- Request body: none.
- Response body: array of maintenance records.
- Validation rules: none.
- Possible errors: `401`.

### `POST /maintenance`
- Purpose: create a maintenance record.
- Authentication: required.
- Role permissions: admin, fleet manager, safety officer.
- Request body: `MaintenanceRecord` without `id`.
- Response body: created maintenance record.
- Validation rules: vehicle required; in-shop status should be reflected in fleet state.
- Possible errors: `422`, `409`.

### `PATCH /maintenance/{id}`
- Purpose: update a maintenance record.
- Authentication: required.
- Role permissions: admin, fleet manager, safety officer.
- Request body: partial maintenance fields.
- Response body: updated maintenance record.
- Validation rules: completedDate required when status is completed.
- Possible errors: `404`, `409`, `422`.

### `DELETE /maintenance/{id}`
- Purpose: delete a maintenance record.
- Authentication: required.
- Role permissions: admin.
- Request body: none.
- Response body: `{ "success": true }`.
- Possible errors: `404`, `409`.

## Fuel Logs

### `GET /fuel`
- Purpose: list fuel logs.
- Authentication: required.
- Role permissions: all authenticated roles.
- Request body: none.
- Response body: array of fuel log records.
- Validation rules: none.
- Possible errors: `401`.

### `POST /fuel`
- Purpose: create a fuel log.
- Authentication: required.
- Role permissions: admin, fleet manager, dispatcher.
- Request body: `FuelLog` without `id` and `totalCost`.
- Response body: created fuel log.
- Validation rules: liters and unit price must be positive.
- Possible errors: `422`, `409`.

### `PATCH /fuel/{id}`
- Purpose: update a fuel log.
- Authentication: required.
- Role permissions: admin, fleet manager, dispatcher.
- Request body: partial fuel log fields.
- Response body: updated fuel log.
- Validation rules: total cost must equal liters × unit price.
- Possible errors: `404`, `409`, `422`.

### `DELETE /fuel/{id}`
- Purpose: delete a fuel log.
- Authentication: required.
- Role permissions: admin.
- Request body: none.
- Response body: `{ "success": true }`.
- Possible errors: `404`, `409`.

## Expenses

### `GET /expenses`
- Purpose: list expenses.
- Authentication: required.
- Role permissions: all authenticated roles.
- Request body: none.
- Response body: array of expense records.
- Validation rules: none.
- Possible errors: `401`.

### `POST /expenses`
- Purpose: create an expense.
- Authentication: required.
- Role permissions: admin, fleet manager, financial analyst.
- Request body: `Expense` without `id`.
- Response body: created expense.
- Validation rules: amount must be positive.
- Possible errors: `422`, `409`.

### `PATCH /expenses/{id}`
- Purpose: update an expense.
- Authentication: required.
- Role permissions: admin, fleet manager, financial analyst.
- Request body: partial expense fields.
- Response body: updated expense.
- Validation rules: approved expenses should be immutable unless reopened.
- Possible errors: `404`, `409`, `422`.

### `DELETE /expenses/{id}`
- Purpose: delete an expense.
- Authentication: required.
- Role permissions: admin.
- Request body: none.
- Response body: `{ "success": true }`.
- Possible errors: `404`, `409`.

## Reports

### `GET /reports`
- Purpose: fetch generated operational summaries.
- Authentication: required.
- Role permissions: admin, financial analyst.
- Request body: none.
- Response body: report payload containing generated timestamp and summary data.
- Validation rules: summary must match dashboard aggregates.
- Possible errors: `401`, `403`.
