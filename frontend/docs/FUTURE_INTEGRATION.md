# Future Integration

The frontend is already isolated behind `lib/api/*`, so the backend replacement path is narrow.

## Replacement Strategy
1. Keep the page components unchanged.
2. Replace the mock implementations inside `lib/api/*` with real HTTP or Supabase-backed calls.
3. Preserve the request and response payload shapes.
4. Keep the auth service returning the same session object shape.
5. Retain business-rule errors with compatible codes and messages.

## What Should Not Change
- Route structure.
- Form schemas.
- Table layouts.
- Map component data contract.
- Role guard usage.
- Query keys and mutation flows.

## Backend Handoff Checklist
- Confirm all endpoint paths and payloads match `docs/API_CONTRACT.md`.
- Verify dashboard aggregates are derived from the same operational tables.
- Ensure all dates remain ISO strings.
- Keep nullable relationships explicit in the schema.
- Verify retired vehicles, suspended drivers, and capacity rules on the server.
