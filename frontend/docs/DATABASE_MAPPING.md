# Database Mapping

This maps frontend surfaces to the SQL tables already present in `Database/`.

| Page | Primary Tables | Supporting Tables |
| --- | --- | --- |
| Login | `profiles` | - |
| Dashboard | `vehicles`, `trips`, `drivers`, `maintenance_logs`, `fuel_logs`, `expenses` | `profiles` |
| Vehicles | `vehicles` | `trips`, `maintenance_logs` |
| Drivers | `drivers` | `profiles`, `trips` |
| Trips | `trips` | `vehicles`, `drivers` |
| Maintenance | `maintenance_logs` | `vehicles` |
| Fuel Logs | `fuel_logs` | `vehicles`, `drivers` |
| Expenses | `expenses` | `trips`, `vehicles`, `profiles` |
| Reports | all operational tables | `profiles` |
| Settings | `profiles` | - |

## Notes
- `profiles` holds user/session-oriented data for auth and role presentation.
- Derived dashboard values are aggregated from the operational tables.
- The mock layer currently synthesizes map points from vehicle locations and trip context.
