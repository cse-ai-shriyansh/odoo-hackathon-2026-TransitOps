-- ==========================================================
-- DRIVERS TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_code TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    license_number TEXT NOT NULL,
    license_class TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    date_of_birth DATE NOT NULL,
    hire_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',

    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    created_by UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_drivers_employee_code UNIQUE (employee_code),
    CONSTRAINT uq_drivers_license_number UNIQUE (license_number),
    CONSTRAINT uq_drivers_email UNIQUE (email),

    CONSTRAINT chk_driver_name
        CHECK (char_length(trim(full_name)) BETWEEN 2 AND 150),

    CONSTRAINT chk_driver_phone
        CHECK (phone ~ '^\+?[1-9][0-9]{7,14}$'),

    CONSTRAINT chk_driver_email
        CHECK (
            email IS NULL
            OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        ),

    CONSTRAINT chk_emergency_phone
        CHECK (
            emergency_contact_phone IS NULL
            OR emergency_contact_phone ~ '^\+?[1-9][0-9]{7,14}$'
        ),

    CONSTRAINT chk_license_expiry
        CHECK (license_expiry >= hire_date),

    CONSTRAINT chk_driver_age
        CHECK (
            date_of_birth <= (CURRENT_DATE - INTERVAL '18 years')
        ),

    CONSTRAINT chk_hire_date
        CHECK (hire_date <= CURRENT_DATE),

    CONSTRAINT chk_driver_status
        CHECK (
            status IN (
                'active',
                'on_leave',
                'suspended',
                'inactive',
                'retired'
            )
        )
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_drivers_status
ON public.drivers(status);

CREATE INDEX IF NOT EXISTS idx_drivers_license_expiry
ON public.drivers(license_expiry);

CREATE INDEX IF NOT EXISTS idx_drivers_created_by
ON public.drivers(created_by);

CREATE INDEX IF NOT EXISTS idx_drivers_full_name
ON public.drivers(full_name);

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

DROP TRIGGER IF EXISTS trg_drivers_set_updated_at
ON public.drivers;

CREATE TRIGGER trg_drivers_set_updated_at
BEFORE UPDATE
ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES
-- ==========================================================

-- Admin: Full Access
CREATE POLICY drivers_admin_all
ON public.drivers
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

-- Fleet Manager: Full Read/Write
CREATE POLICY drivers_fleet_manager_all
ON public.drivers
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
CREATE POLICY drivers_dispatcher_all
ON public.drivers
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

-- Safety Officer: Read + Update
CREATE POLICY drivers_safety_officer_read
ON public.drivers
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

CREATE POLICY drivers_safety_officer_update
ON public.drivers
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'safety_officer'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'safety_officer'
    )
);

-- Financial Analyst: Read Only
CREATE POLICY drivers_financial_analyst_read
ON public.drivers
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
-- Replace created_by with an existing profile UUID.
-- ==========================================================

/*
INSERT INTO public.drivers (
    employee_code,
    full_name,
    phone,
    email,
    license_number,
    license_class,
    license_expiry,
    date_of_birth,
    hire_date,
    status,
    emergency_contact_name,
    emergency_contact_phone,
    created_by
)
VALUES (
    'DRV-0001',
    'Rahul Sharma',
    '+919876543210',
    'rahul.sharma@example.com',
    'DL123456789',
    'HMV',
    '2030-05-15',
    '1992-08-20',
    '2024-01-10',
    'active',
    'Amit Sharma',
    '+919812345678',
    '<EXISTING_PROFILE_UUID>'
);
*/