-- ==========================================================
-- EXPENSES TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    expense_number TEXT NOT NULL UNIQUE,

    vehicle_id UUID
        REFERENCES public.vehicles(id)
        ON DELETE SET NULL,

    driver_id UUID
        REFERENCES public.drivers(id)
        ON DELETE SET NULL,

    trip_id UUID
        REFERENCES public.trips(id)
        ON DELETE SET NULL,

    created_by UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT,

    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,

    category TEXT NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    payment_method TEXT NOT NULL,

    vendor_name TEXT,

    invoice_number TEXT UNIQUE,

    description TEXT,

    receipt_url TEXT,

    status TEXT NOT NULL DEFAULT 'pending',

    approved_by UUID
        REFERENCES public.profiles(id)
        ON DELETE SET NULL,

    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_expense_category
        CHECK (
            category IN (
                'fuel',
                'maintenance',
                'toll',
                'parking',
                'driver_allowance',
                'repair',
                'insurance',
                'registration',
                'tax',
                'cleaning',
                'office',
                'other'
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

    CONSTRAINT chk_status
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'reimbursed'
            )
        ),

    CONSTRAINT chk_amount
        CHECK (amount > 0),

    CONSTRAINT chk_receipt_url
        CHECK (
            receipt_url IS NULL
            OR receipt_url ~* '^https?://'
        ),

    CONSTRAINT chk_approval
        CHECK (
            (status = 'pending' AND approved_by IS NULL AND approved_at IS NULL)
            OR
            (status IN ('approved', 'rejected', 'reimbursed') AND approved_by IS NOT NULL)
        )
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_expenses_date
ON public.expenses(expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category
ON public.expenses(category);

CREATE INDEX IF NOT EXISTS idx_expenses_status
ON public.expenses(status);

CREATE INDEX IF NOT EXISTS idx_expenses_vehicle
ON public.expenses(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_expenses_driver
ON public.expenses(driver_id);

CREATE INDEX IF NOT EXISTS idx_expenses_trip
ON public.expenses(trip_id);

CREATE INDEX IF NOT EXISTS idx_expenses_created_by
ON public.expenses(created_by);

CREATE INDEX IF NOT EXISTS idx_expenses_approved_by
ON public.expenses(approved_by);

CREATE INDEX IF NOT EXISTS idx_expenses_category_date
ON public.expenses(category, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_status_date
ON public.expenses(status, expense_date DESC);

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

DROP TRIGGER IF EXISTS trg_expenses_set_updated_at
ON public.expenses;

CREATE TRIGGER trg_expenses_set_updated_at
BEFORE UPDATE
ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ==========================================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES
-- ==========================================================

-- Admin: Full Access
CREATE POLICY expenses_admin_all
ON public.expenses
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
CREATE POLICY expenses_fleet_manager_all
ON public.expenses
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

-- Dispatcher: Create and Read
CREATE POLICY expenses_dispatcher_select
ON public.expenses
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

CREATE POLICY expenses_dispatcher_insert
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'dispatcher'
    )
);

-- Safety Officer: Read Only
CREATE POLICY expenses_safety_officer_read
ON public.expenses
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

-- Financial Analyst: Full Financial Access
CREATE POLICY expenses_financial_analyst_all
ON public.expenses
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'financial_analyst'
    )
)
WITH CHECK (
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
INSERT INTO public.expenses (
    expense_number,
    vehicle_id,
    driver_id,
    trip_id,
    created_by,
    expense_date,
    category,
    amount,
    payment_method,
    vendor_name,
    invoice_number,
    description,
    receipt_url,
    status
)
VALUES (
    'EXP-20260712-001',
    '<VEHICLE_UUID>',
    '<DRIVER_UUID>',
    '<TRIP_UUID>',
    '<PROFILE_UUID>',
    CURRENT_DATE,
    'toll',
    450.00,
    'upi',
    'NHAI Toll Plaza',
    'INV-TOLL-001',
    'Raipur to Bilaspur Toll Charges',
    'https://storage.example.com/receipts/toll001.pdf',
    'pending'
);
*/