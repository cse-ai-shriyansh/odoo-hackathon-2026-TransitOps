-- ==========================================================
-- MAINTENANCE_LOGS TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    vehicle_id UUID NOT NULL
        REFERENCES public.vehicles(id)
        ON DELETE RESTRICT,

    maintenance_type TEXT NOT NULL,

    description TEXT,

    maintenance_date DATE NOT NULL,

    next_due_date DATE,

    odometer_reading_km NUMERIC(10,2) NOT NULL,

    cost NUMERIC(12,2) NOT NULL DEFAULT 0,

    service_provider TEXT,

    invoice_number TEXT,

    status TEXT NOT NULL DEFAULT 'completed',

    created_by UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_maintenance_type
        CHECK (
            maintenance_type IN (
                'preventive',
                'corrective',
                'inspection',
                'oil_change',
                'tire_service',
                'brake_service',
                'engine_service',
                'battery_service',
                'other'
            )
        ),

    CONSTRAINT chk_maintenance_status
        CHECK (
            status IN (
                'scheduled',
                'in_progress',
                'completed',
                'cancelled'
            )
        ),

    CONSTRAINT chk_odometer_reading
        CHECK (odometer_reading_km >= 0),

    CONSTRAINT chk_cost
        CHECK (cost >= 0),

    CONSTRAINT chk_due_date
        CHECK (
            next_due_date IS NULL
            OR next_due_date >= maintenance_date
        ),

    CONSTRAINT uq_invoice_number
        UNIQUE (invoice_number)
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_vehicle
ON public.maintenance_logs(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_date
ON public.maintenance_logs(maintenance_date DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status
ON public.maintenance_logs(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_type
ON public.maintenance_logs(maintenance_type);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_created_by
ON public.maintenance_logs(created_by);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_next_due
ON public.maintenance_logs(next_due_date);

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

DROP TRIGGER IF EXISTS trg_maintenance_logs_set_updated_at
ON public.maintenance_logs;

CREATE TRIGGER trg_maintenance_logs_set_updated_at
BEFORE UPDATE
ON public.maintenance_logs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ==========================================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES
-- ==========================================================

-- Admin: Full Access
CREATE POLICY maintenance_logs_admin_all
ON public.maintenance_logs
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
CREATE POLICY maintenance_logs_fleet_manager_all
ON public.maintenance_logs
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

-- Dispatcher: Read Only
CREATE POLICY maintenance_logs_dispatcher_read
ON public.maintenance_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'dispatcher'
    )
);

-- Safety Officer: Read Only
CREATE POLICY maintenance_logs_safety_officer_read
ON public.maintenance_logs
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
CREATE POLICY maintenance_logs_financial_analyst_read
ON public.maintenance_logs
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
INSERT INTO public.maintenance_logs (
    vehicle_id,
    maintenance_type,
    description,
    maintenance_date,
    next_due_date,
    odometer_reading_km,
    cost,
    service_provider,
    invoice_number,
    status,
    created_by
)
VALUES (
    '<VEHICLE_UUID>',
    'oil_change',
    'Engine oil and oil filter replacement',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '180 days',
    48500,
    4200.00,
    'Tata Authorized Service Center',
    'INV-2026-001',
    'completed',
    '<PROFILE_UUID>'
);
*/