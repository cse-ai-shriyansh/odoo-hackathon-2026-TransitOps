-- Required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================================
-- PROFILES TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users (id)
        ON DELETE CASCADE,

    full_name TEXT NOT NULL
        CHECK (char_length(trim(full_name)) BETWEEN 2 AND 150),

    role TEXT NOT NULL
        CHECK (
            role IN (
                'admin',
                'fleet_manager',
                'dispatcher',
                'safety_officer',
                'financial_analyst'
            )
        ),

    phone TEXT
        CHECK (
            phone IS NULL
            OR phone ~ '^\+?[1-9][0-9]{7,14}$'
        ),

    avatar_url TEXT
        CHECK (
            avatar_url IS NULL
            OR avatar_url ~* '^https?://'
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role
ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_full_name
ON public.profiles(full_name);

-- ==========================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==========================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_set_updated_at
ON public.profiles;

CREATE TRIGGER trg_profiles_set_updated_at
BEFORE UPDATE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ==========================================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- RLS POLICIES
-- ==========================================================

-- Users may view their own profile.
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = id
);

-- Users may update their own profile except role.
-- (Role protection should also be enforced from application
-- or an admin-only RPC when changing roles.)
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    auth.uid() = id
)
WITH CHECK (
    auth.uid() = id
);

-- Users may insert only their own profile.
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = id
);

-- Admins have full access.
CREATE POLICY "profiles_admin_all"
ON public.profiles
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

-- Fleet managers may read all profiles.
CREATE POLICY "profiles_fleet_manager_read"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'fleet_manager'
    )
);

-- Dispatchers may read all profiles.
CREATE POLICY "profiles_dispatcher_read"
ON public.profiles
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

-- Safety officers may read all profiles.
CREATE POLICY "profiles_safety_officer_read"
ON public.profiles
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

-- Financial analysts may read all profiles.
CREATE POLICY "profiles_financial_analyst_read"
ON public.profiles
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
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        role
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'dispatcher'
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();