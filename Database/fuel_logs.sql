-- ==========================================================
-- FUEL_LOGS TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    vehicle_id UUID NOT NULL
        REFERENCES public.vehicles(id)
        ON DELETE RESTRICT,

    driver_id UUID
        REFERENCES public.drivers(id)
        ON DELETE SET NULL,

    trip_id UUID
        REFERENCES public.trips(id)
        ON DELETE SET NULL,

    created_by UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    fuel_date TIMESTAMPTZ NOT NULL DEFAULT now(),

    fuel_station TEXT NOT NULL,

    fuel_type TEXT NOT NULL,

    quantity_liters NUMERIC(10,2) NOT NULL,

    price_per_liter NUMERIC(10,2) NOT NULL,

    total_cost NUMERIC(12,2) GENERATED ALWAYS AS (
        quantity_liters * price_per_liter
    ) STORED,

    odometer_reading_km NUMERIC(12,2) NOT NULL,

    payment_method TEXT NOT NULL DEFAULT 'cash',

    receipt_number TEXT,

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_fuel_logs_receipt
        UNIQUE (receipt_number),

    CONSTRAINT chk_fuel_type
        CHECK (
            fuel_type IN (
                'diesel',
                'petrol',
                'cng',
                'lng',
                'electric'
            )
        ),

    CONSTRAINT chk_payment_method
        CHECK (
            payment_method IN (
                'cash',
                'card',
                'upi',
                'bank_transfer',
                'company_account',
                'other'
            )
        ),

    CONSTRAINT chk_quantity
        CHECK (quantity_liters > 0),

    CONSTRAINT chk_price
        CHECK (price_per_liter > 0),

    CONSTRAINT chk_odometer
        CHECK (odometer_reading_km >= 0)
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle
ON public.fuel_logs(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_driver
ON public.fuel_logs(driver_id);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_trip
ON public.fuel_logs(trip_id);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_created_by
ON public.fuel_logs(created_by);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_date
ON public.fuel_logs(fuel_date DESC);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle_date
ON public.fuel_logs(vehicle_id, fuel_date DESC);

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

DROP TRIGGER IF EXISTS trg_fuel_logs_set_updated_at
ON public.fuel_logs;

CREATE TRIGGER trg_fuel_logs_set_updated_at
BEFORE UPDATE
ON public.fuel_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ==========================================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES
-- ==========================================================

-- Admin: Full Access
CREATE POLICY fuel_logs_admin_all
ON public.fuel_logs
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
CREATE POLICY fuel_logs_fleet_manager_all
ON public.fuel_logs
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
CREATE POLICY fuel_logs_dispatcher_all
ON public.fuel_logs
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
CREATE POLICY fuel_logs_safety_officer_read
ON public.fuel_logs
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
CREATE POLICY fuel_logs_financial_analyst_read
ON public.fuel_logs
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
-- EXAMPLE INSERT (COMMENTED)
-- ==========================================================

/*
INSERT INTO public.fuel_logs (
    vehicle_id,
    driver_id,
    trip_id,
    created_by,
    fuel_station,
    fuel_type,
    quantity_liters,
    price_per_liter,
    odometer_reading_km,
    payment_method,
    receipt_number,
    remarks
)
VALUES (
    '<VEHICLE_UUID>',
    '<DRIVER_UUID>',
    '<TRIP_UUID>',
    '<PROFILE_UUID>',
    'Indian Oil - Raipur',
    'diesel',
    85.50,
    92.30,
    125450,
    'upi',
    'FUEL-20260712-001',
    'Fuel filled before dispatch'
);
*/