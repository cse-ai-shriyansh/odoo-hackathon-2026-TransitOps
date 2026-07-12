-- ==========================================================
-- VEHICLES TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    registration_number TEXT NOT NULL,
    vin TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    manufacturing_year INTEGER NOT NULL,
    vehicle_type TEXT NOT NULL,
    fuel_type TEXT NOT NULL,
    capacity_kg NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'active',

    created_by UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_vehicles_registration UNIQUE (registration_number),
    CONSTRAINT uq_vehicles_vin UNIQUE (vin),

    CONSTRAINT chk_vehicle_year
        CHECK (
            manufacturing_year BETWEEN 1950
            AND EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1
        ),

    CONSTRAINT chk_vehicle_type
        CHECK (
            vehicle_type IN (
                'truck',
                'van',
                'bus',
                'car',
                'trailer',
                'motorcycle',
                'other'
            )
        ),

    CONSTRAINT chk_fuel_type
        CHECK (
            fuel_type IN (
                'diesel',
                'petrol',
                'electric',
                'hybrid',
                'cng',
                'lng',
                'other'
            )
        ),

    CONSTRAINT chk_vehicle_status
        CHECK (
            status IN (
                'active',
                'maintenance',
                'inactive',
                'retired'
            )
        ),

    CONSTRAINT chk_capacity
        CHECK (
            capacity_kg IS NULL
            OR capacity_kg >= 0
        )
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_vehicles_status
ON public.vehicles(status);

CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_type
ON public.vehicles(vehicle_type);

CREATE INDEX IF NOT EXISTS idx_vehicles_created_by
ON public.vehicles(created_by);

CREATE INDEX IF NOT EXISTS idx_vehicles_make_model
ON public.vehicles(make, model);

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

DROP TRIGGER IF EXISTS trg_vehicles_set_updated_at
ON public.vehicles;

CREATE TRIGGER trg_vehicles_set_updated_at
BEFORE UPDATE
ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES
-- ==========================================================

-- Admin: Full access
CREATE POLICY vehicles_admin_all
ON public.vehicles
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
CREATE POLICY vehicles_fleet_manager_all
ON public.vehicles
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
CREATE POLICY vehicles_dispatcher_all
ON public.vehicles
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

-- Safety Officer: Read only
CREATE POLICY vehicles_safety_officer_read
ON public.vehicles
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

-- Financial Analyst: Read only
CREATE POLICY vehicles_financial_analyst_read
ON public.vehicles
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
-- Replace the UUID with an existing profile ID.
-- ==========================================================

/*
INSERT INTO public.vehicles (
    registration_number,
    vin,
    make,
    model,
    manufacturing_year,
    vehicle_type,
    fuel_type,
    capacity_kg,
    status,
    created_by
)
VALUES (
    'CG04AB1234',
    '1HGCM82633A123456',
    'Tata',
    'Prima',
    2024,
    'truck',
    'diesel',
    25000,
    'active',
    '<EXISTING_PROFILE_UUID>'
);
*/