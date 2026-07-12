-- ==========================================================
-- TRIPS TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    trip_number TEXT NOT NULL,

    vehicle_id UUID NOT NULL
        REFERENCES public.vehicles(id)
        ON DELETE RESTRICT,

    driver_id UUID NOT NULL
        REFERENCES public.drivers(id)
        ON DELETE RESTRICT,

    dispatched_by UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    origin TEXT NOT NULL,
    destination TEXT NOT NULL,

    scheduled_departure TIMESTAMPTZ NOT NULL,
    scheduled_arrival TIMESTAMPTZ NOT NULL,

    actual_departure TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,

    estimated_distance_km NUMERIC(10,2) NOT NULL,
    actual_distance_km NUMERIC(10,2),

    cargo_description TEXT,

    status TEXT NOT NULL DEFAULT 'scheduled',

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_trips_trip_number
        UNIQUE (trip_number),

    CONSTRAINT chk_trip_schedule
        CHECK (scheduled_arrival > scheduled_departure),

    CONSTRAINT chk_actual_trip_time
        CHECK (
            actual_departure IS NULL
            OR actual_arrival IS NULL
            OR actual_arrival >= actual_departure
        ),

    CONSTRAINT chk_estimated_distance
        CHECK (estimated_distance_km > 0),

    CONSTRAINT chk_actual_distance
        CHECK (
            actual_distance_km IS NULL
            OR actual_distance_km >= 0
        ),

    CONSTRAINT chk_trip_status
        CHECK (
            status IN (
                'scheduled',
                'dispatched',
                'in_progress',
                'completed',
                'cancelled'
            )
        )
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_trips_vehicle
ON public.trips(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_trips_driver
ON public.trips(driver_id);

CREATE INDEX IF NOT EXISTS idx_trips_dispatcher
ON public.trips(dispatched_by);

CREATE INDEX IF NOT EXISTS idx_trips_status
ON public.trips(status);

CREATE INDEX IF NOT EXISTS idx_trips_departure
ON public.trips(scheduled_departure);

CREATE INDEX IF NOT EXISTS idx_trips_arrival
ON public.trips(scheduled_arrival);

CREATE INDEX IF NOT EXISTS idx_trips_vehicle_status
ON public.trips(vehicle_id, status);

CREATE INDEX IF NOT EXISTS idx_trips_driver_status
ON public.trips(driver_id, status);

-- ==========================================================
-- UPDATED_AT TRIGGER
-- ==========================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trips_set_updated_at
ON public.trips;

CREATE TRIGGER trg_trips_set_updated_at
BEFORE UPDATE
ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES
-- ==========================================================

-- Admin: Full Access
CREATE POLICY trips_admin_all
ON public.trips
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'admin'
    )
);

-- Fleet Manager: Read/Write
CREATE POLICY trips_fleet_manager_all
ON public.trips
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'fleet_manager'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'fleet_manager'
    )
);

-- Dispatcher: Read/Write
CREATE POLICY trips_dispatcher_all
ON public.trips
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'dispatcher'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'dispatcher'
    )
);

-- Safety Officer: Read Only
CREATE POLICY trips_safety_officer_read
ON public.trips
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'safety_officer'
    )
);

-- Financial Analyst: Read Only
CREATE POLICY trips_financial_analyst_read
ON public.trips
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'financial_analyst'
    )
);

-- ==========================================================
-- EXAMPLE INSERT
-- Replace UUIDs with existing records.
-- ==========================================================

/*
INSERT INTO public.trips (
    trip_number,
    vehicle_id,
    driver_id,
    dispatched_by,
    origin,
    destination,
    scheduled_departure,
    scheduled_arrival,
    estimated_distance_km,
    cargo_description,
    status
)
VALUES (
    'TRIP-20260712-001',
    '<VEHICLE_UUID>',
    '<DRIVER_UUID>',
    '<PROFILE_UUID>',
    'Raipur',
    'Bilaspur',
    '2026-07-13 08:00:00+05:30',
    '2026-07-13 12:00:00+05:30',
    126.50,
    'Construction Materials',
    'scheduled'
);
*/