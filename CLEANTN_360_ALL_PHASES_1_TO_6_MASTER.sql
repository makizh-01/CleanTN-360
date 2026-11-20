-- ==============================================================================
-- CLEANTN 360 – COMPLETE MASTER SUPABASE DATABASE SCHEMA (PHASES 1 TO 6)
-- Tamil Nadu Smart Waste Management, Green Money Wallet, 38-District GIS,
-- AI Waste Intelligence, Predictive Analytics, IoT, Fleet, Gov & Rollout
-- ==============================================================================
-- HOW TO RUN IN SUPABASE:
-- 1. Open Supabase Dashboard -> SQL Editor -> New Query
-- 2. Copy & paste this entire SQL file and click RUN
-- 3. 100% Idempotent: Safe to run on a fresh project or re-run cleanly
-- 4. Includes all Enums, 40+ Tables, Indexes, Seed Data (38 TN Districts,
--    Waste Categories, CPCB Emission Factors, Sample Hubs), Atomic RPCs,
--    Triggers, Storage Buckets, and Row-Level Security (RLS) Policies.
-- ==============================================================================


-- >>>>>>>>>>>>>>>>>>>> PART 1: CORE AUTH, DEPOSITS, WALLET & STORAGE (PHASES 1-2) <<<<<<<<<<<<<<<<<<<<
-- ====================================================================
-- CLEAN TN 360 - PHASE 2 DATABASE INITIALIZATION & MIGRATION SCRIPT
-- Smart Waste Management & Green Money Ecosystem for Tamil Nadu
-- ====================================================================

-- 0. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('citizen', 'collector', 'admin', 'state_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_status') THEN
        CREATE TYPE deposit_status AS ENUM ('submitted', 'collector_verified', 'admin_approved', 'rejected', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('deposit_reward', 'redemption', 'adjustment', 'reversal', 'redemption_reversal', 'admin_adjustment');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
        CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');
    END IF;
END $$;

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- TABLE 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'citizen',
    district TEXT NOT NULL,
    city TEXT,
    address TEXT,
    profile_image TEXT,
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 2: districts (38 Tamil Nadu districts)
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_name TEXT UNIQUE NOT NULL,
    district_code TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL DEFAULT 'Tamil Nadu',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 3: collection_points
CREATE TABLE IF NOT EXISTS public.collection_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    point_code TEXT UNIQUE NOT NULL,
    point_name TEXT NOT NULL,
    district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    operating_hours TEXT NOT NULL DEFAULT '8:00 AM - 7:00 PM',
    accepted_waste_types TEXT[] NOT NULL DEFAULT ARRAY['Plastic', 'Paper', 'Metal', 'Glass'],
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 4: collector_assignments
CREATE TABLE IF NOT EXISTS public.collector_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    collection_point_id UUID NOT NULL REFERENCES public.collection_points(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    UNIQUE (collector_id, collection_point_id)
);

-- TABLE 5: waste_categories
CREATE TABLE IF NOT EXISTS public.waste_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT UNIQUE NOT NULL,
    reward_points_per_kg INTEGER NOT NULL CHECK (reward_points_per_kg >= 0),
    description TEXT,
    icon_symbol TEXT DEFAULT '♻',
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- TABLE 6: waste_deposits
CREATE TABLE IF NOT EXISTS public.waste_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deposit_code TEXT UNIQUE NOT NULL,
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    collection_point_id UUID NOT NULL REFERENCES public.collection_points(id) ON DELETE RESTRICT,
    waste_category_id UUID NOT NULL REFERENCES public.waste_categories(id) ON DELETE RESTRICT,
    weight_kg NUMERIC(8,2) NOT NULL CHECK (weight_kg > 0),
    reward_rate INTEGER NOT NULL CHECK (reward_rate >= 0),
    estimated_points INTEGER NOT NULL CHECK (estimated_points >= 0),
    approved_points INTEGER DEFAULT NULL CHECK (approved_points IS NULL OR approved_points >= 0),
    citizen_remarks TEXT,
    proof_image_url TEXT,
    status deposit_status NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 7: deposit_verifications
CREATE TABLE IF NOT EXISTS public.deposit_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deposit_id UUID UNIQUE NOT NULL REFERENCES public.waste_deposits(id) ON DELETE CASCADE,
    collector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    actual_weight_kg NUMERIC(8,2) NOT NULL CHECK (actual_weight_kg > 0),
    verified_category_id UUID NOT NULL REFERENCES public.waste_categories(id) ON DELETE RESTRICT,
    scale_photo_url TEXT NOT NULL,
    waste_photo_url TEXT,
    collector_remarks TEXT,
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'discrepancy', 'flagged')),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 8: wallet_accounts
CREATE TABLE IF NOT EXISTS public.wallet_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    available_points INTEGER NOT NULL DEFAULT 0 CHECK (available_points >= 0),
    lifetime_earned_points INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_earned_points >= 0),
    lifetime_redeemed_points INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_redeemed_points >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 9: wallet_transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    deposit_id UUID REFERENCES public.waste_deposits(id) ON DELETE SET NULL,
    transaction_type transaction_type NOT NULL,
    points INTEGER NOT NULL,
    conversion_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected', 'reversed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 10: support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code TEXT UNIQUE NOT NULL,
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'Open',
    admin_response TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 11: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    previous_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_collection_points_district ON public.collection_points(district_id);
CREATE INDEX IF NOT EXISTS idx_collection_points_code ON public.collection_points(point_code);
CREATE INDEX IF NOT EXISTS idx_waste_deposits_citizen ON public.waste_deposits(citizen_id);
CREATE INDEX IF NOT EXISTS idx_waste_deposits_point ON public.waste_deposits(collection_point_id);
CREATE INDEX IF NOT EXISTS idx_waste_deposits_status ON public.waste_deposits(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_citizen ON public.wallet_transactions(citizen_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_citizen ON public.support_tickets(citizen_id);

-- ====================================================================
-- 4. SEED DATA
-- ====================================================================

-- Seed Districts (All 38 Districts of Tamil Nadu)
INSERT INTO public.districts (district_name, district_code) VALUES
('Ariyalur', 'ARI'),
('Chengalpattu', 'CGL'),
('Chennai', 'CHN'),
('Coimbatore', 'CBE'),
('Cuddalore', 'CUD'),
('Dharmapuri', 'DMR'),
('Dindigul', 'DGL'),
('Erode', 'ERD'),
('Kallakurichi', 'KLK'),
('Kancheepuram', 'KCH'),
('Kanniyakumari', 'KKM'),
('Karur', 'KRR'),
('Krishnagiri', 'KRI'),
('Madurai', 'MDU'),
('Mayiladuthurai', 'MYD'),
('Nagapattinam', 'NGP'),
('Namakkal', 'NMK'),
('Nilgiris', 'NLG'),
('Perambalur', 'PBL'),
('Pudukkottai', 'PDK'),
('Ramanathapuram', 'RMD'),
('Ranipet', 'RPT'),
('Salem', 'SLM'),
('Sivaganga', 'SVG'),
('Tenkasi', 'TKS'),
('Thanjavur', 'TNJ'),
('Theni', 'THN'),
('Thoothukudi', 'TUT'),
('Tiruchirappalli', 'TRY'),
('Tirunelveli', 'TNV'),
('Tirupathur', 'TPR'),
('Tiruppur', 'UPR'),
('Tiruvallur', 'TVR'),
('Tiruvannamalai', 'TNM'),
('Tiruvarur', 'TVU'),
('Vellore', 'VEL'),
('Viluppuram', 'VLP'),
('Virudhunagar', 'VRD')
ON CONFLICT (district_name) DO NOTHING;

-- Seed Waste Categories (Configurable pilot rates)
INSERT INTO public.waste_categories (category_name, reward_points_per_kg, description, icon_symbol, is_active) VALUES
('Plastic', 50, 'Dry plastic bottles, containers, clean poly bags, PET and HDPE packaging.', '♻', true),
('Paper', 40, 'Cardboard, newspapers, office papers, notebooks, cartons and cartons.', '▤', true),
('Metal', 60, 'Tin cans, aluminum beverage cans, iron scraps, metallic containers.', '▣', true),
('Glass', 50, 'Bottles, jars, broken glass packaged securely in protective wrap.', '♢', true),
('Organic', 20, 'Segregated wet vegetable/fruit bio-waste, compostable kitchen organics.', '❧', true),
('E-Waste', 100, 'Obsolete electronics, cables, batteries. Dispatched strictly to authorised recyclers.', '⌘', true)
ON CONFLICT (category_name) DO NOTHING;

-- Seed Sample Collection Points (Coimbatore & Chennai initial hubs)
DO $$
DECLARE
    cbe_id UUID;
    chn_id UUID;
BEGIN
    SELECT id INTO cbe_id FROM public.districts WHERE district_name = 'Coimbatore' LIMIT 1;
    SELECT id INTO chn_id FROM public.districts WHERE district_name = 'Chennai' LIMIT 1;

    IF cbe_id IS NOT NULL THEN
        INSERT INTO public.collection_points (point_code, point_name, district_id, address, latitude, longitude, operating_hours, accepted_waste_types, status)
        VALUES 
        ('CTN-CBE-001', 'R.S. Puram Collection Point', cbe_id, 'Diwan Bahadur Rd, R.S. Puram, Coimbatore - 641002', 11.0116, 76.9458, '8:00 AM - 8:00 PM', ARRAY['Plastic', 'Paper', 'Metal', 'Glass'], 'active'),
        ('CTN-CBE-002', 'Gandhipuram Central Point', cbe_id, 'Cross Cut Road, Gandhipuram, Coimbatore - 641012', 11.0168, 76.9673, '7:30 AM - 8:30 PM', ARRAY['Plastic', 'Paper', 'Organic'], 'active'),
        ('CTN-CBE-003', 'Peelamedu Tech Hub Point', cbe_id, 'Avinashi Rd, Peelamedu, Coimbatore - 641004', 11.0285, 77.0028, '8:00 AM - 7:00 PM', ARRAY['Plastic', 'Metal', 'E-Waste'], 'active')
        ON CONFLICT (point_code) DO NOTHING;
    END IF;

    IF chn_id IS NOT NULL THEN
        INSERT INTO public.collection_points (point_code, point_name, district_id, address, latitude, longitude, operating_hours, accepted_waste_types, status)
        VALUES 
        ('CTN-CHN-001', 'T. Nagar Civic Center', chn_id, 'Usman Road, T. Nagar, Chennai - 600017', 13.0418, 80.2341, '8:00 AM - 8:00 PM', ARRAY['Plastic', 'Paper', 'Metal', 'Glass', 'E-Waste'], 'active'),
        ('CTN-CHN-002', 'Adyar Green Hub', chn_id, 'Sardar Patel Rd, Adyar, Chennai - 600020', 13.0012, 80.2565, '8:00 AM - 7:00 PM', ARRAY['Plastic', 'Organic', 'Glass'], 'active')
        ON CONFLICT (point_code) DO NOTHING;
    END IF;
END $$;

-- ====================================================================
-- 5. AUTOMATIC PROFILE & WALLET PROVISIONING TRIGGER
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    -- Insert profile with public registration safety: default role is always 'citizen'
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        role,
        district,
        city,
        address,
        account_status
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        'citizen', -- Strictly enforce citizen role for public signups
        COALESCE(NEW.raw_user_meta_data->>'district', 'Coimbatore'),
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'address',
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        district = EXCLUDED.district;

    -- Provision wallet ledger for citizen
    INSERT INTO public.wallet_accounts (
        citizen_id,
        available_points,
        lifetime_earned_points,
        lifetime_redeemed_points
    ) VALUES (
        NEW.id,
        0,
        0,
        0
    )
    ON CONFLICT (citizen_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 6. SECURE RPC FUNCTIONS (IDEMPOTENT ATOMIC TRANSACTIONS)
-- ====================================================================

-- FUNCTION 1: approve_and_credit_deposit
CREATE OR REPLACE FUNCTION public.approve_and_credit_deposit(
    p_deposit_id UUID,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deposit RECORD;
    v_verification RECORD;
    v_category RECORD;
    v_final_points INTEGER;
    v_rupee_value NUMERIC(10,2);
    v_admin_role user_role;
BEGIN
    -- 1. Verify caller has admin privileges
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can approve deposits.';
    END IF;

    -- 2. Lock deposit record for update to prevent concurrent double-approval
    SELECT * INTO v_deposit 
    FROM public.waste_deposits 
    WHERE id = p_deposit_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deposit with ID % not found.', p_deposit_id;
    END IF;

    -- Idempotency check: Cannot approve twice or re-approve already handled deposits
    IF v_deposit.status = 'admin_approved' THEN
        RAISE EXCEPTION 'Idempotency block: Deposit % has already been approved and credited.', v_deposit.deposit_code;
    END IF;

    IF v_deposit.status != 'collector_verified' THEN
        RAISE EXCEPTION 'Invalid transition: Deposit must be verified by a collector before admin approval. Current status: %', v_deposit.status;
    END IF;

    -- 3. Fetch collector verification details
    SELECT * INTO v_verification 
    FROM public.deposit_verifications 
    WHERE deposit_id = p_deposit_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deposit verification record missing for %', p_deposit_id;
    END IF;

    -- 4. Get active reward rate for verified category
    SELECT * INTO v_category 
    FROM public.waste_categories 
    WHERE id = v_verification.verified_category_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Waste category not found.';
    END IF;

    -- 5. Calculate Points: verified actual weight * category rate (standard rounded)
    v_final_points := ROUND(v_verification.actual_weight_kg * v_category.reward_points_per_kg);
    v_rupee_value := ROUND(v_final_points / 100.0, 2); -- 100 points = Rs. 1

    -- 6. Credit Citizen Wallet Ledger
    UPDATE public.wallet_accounts
    SET 
        available_points = available_points + v_final_points,
        lifetime_earned_points = lifetime_earned_points + v_final_points,
        updated_at = NOW()
    WHERE citizen_id = v_deposit.citizen_id;

    -- 7. Insert Immutable Wallet Transaction
    INSERT INTO public.wallet_transactions (
        citizen_id,
        deposit_id,
        transaction_type,
        points,
        conversion_value,
        description,
        status
    ) VALUES (
        v_deposit.citizen_id,
        p_deposit_id,
        'deposit_reward',
        v_final_points,
        v_rupee_value,
        FORMAT('Reward for deposit %s: %s kg %s', v_deposit.deposit_code, v_verification.actual_weight_kg, v_category.category_name),
        'completed'
    );

    -- 8. Update Deposit Status to admin_approved
    UPDATE public.waste_deposits
    SET 
        status = 'admin_approved',
        approved_points = v_final_points,
        approved_by = p_admin_id,
        approved_at = NOW()
    WHERE id = p_deposit_id;

    -- 9. Record Audit Log
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        previous_data,
        new_data
    ) VALUES (
        p_admin_id,
        'APPROVE_DEPOSIT',
        'waste_deposits',
        p_deposit_id::TEXT,
        jsonb_build_object('status', 'collector_verified', 'estimated_points', v_deposit.estimated_points),
        jsonb_build_object('status', 'admin_approved', 'approved_points', v_final_points, 'verified_weight', v_verification.actual_weight_kg)
    );

    RETURN jsonb_build_object(
        'success', true,
        'deposit_id', p_deposit_id,
        'status', 'admin_approved',
        'points_credited', v_final_points,
        'wallet_rupee_value', v_rupee_value
    );
END;
$$;

-- FUNCTION 2: reject_deposit
CREATE OR REPLACE FUNCTION public.reject_deposit(
    p_deposit_id UUID,
    p_admin_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deposit RECORD;
    v_admin_role user_role;
BEGIN
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can reject deposits.';
    END IF;

    SELECT * INTO v_deposit FROM public.waste_deposits WHERE id = p_deposit_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deposit with ID % not found.', p_deposit_id;
    END IF;

    IF v_deposit.status = 'admin_approved' THEN
        RAISE EXCEPTION 'Cannot reject an already approved and credited deposit.';
    END IF;

    UPDATE public.waste_deposits
    SET 
        status = 'rejected',
        rejection_reason = p_reason,
        approved_by = p_admin_id,
        approved_at = NOW()
    WHERE id = p_deposit_id;

    INSERT INTO public.audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        previous_data,
        new_data
    ) VALUES (
        p_admin_id,
        'REJECT_DEPOSIT',
        'waste_deposits',
        p_deposit_id::TEXT,
        jsonb_build_object('status', v_deposit.status),
        jsonb_build_object('status', 'rejected', 'reason', p_reason)
    );

    RETURN jsonb_build_object(
        'success', true,
        'deposit_id', p_deposit_id,
        'status', 'rejected'
    );
END;
$$;

-- FUNCTION 3: redeem_wallet_points (Simulated UPI cash out)
CREATE OR REPLACE FUNCTION public.redeem_wallet_points(
    p_citizen_id UUID,
    p_points INTEGER,
    p_upi_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account RECORD;
    v_rupee_value NUMERIC(10,2);
BEGIN
    IF p_points <= 0 THEN
        RAISE EXCEPTION 'Redemption points must be greater than zero.';
    END IF;

    SELECT * INTO v_account 
    FROM public.wallet_accounts 
    WHERE citizen_id = p_citizen_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet account not found.';
    END IF;

    IF v_account.available_points < p_points THEN
        RAISE EXCEPTION 'Insufficient points balance. Available: %, Requested: %', v_account.available_points, p_points;
    END IF;

    v_rupee_value := ROUND(p_points / 100.0, 2);

    -- Debit wallet
    UPDATE public.wallet_accounts
    SET 
        available_points = available_points - p_points,
        lifetime_redeemed_points = lifetime_redeemed_points + p_points,
        updated_at = NOW()
    WHERE citizen_id = p_citizen_id;

    -- Record transaction
    INSERT INTO public.wallet_transactions (
        citizen_id,
        deposit_id,
        transaction_type,
        points,
        conversion_value,
        description,
        status
    ) VALUES (
        p_citizen_id,
        NULL,
        'redemption',
        -p_points,
        v_rupee_value,
        FORMAT('Simulated UPI Redemption to %s (Rs. %s)', p_upi_id, v_rupee_value),
        'completed'
    );

    RETURN jsonb_build_object(
        'success', true,
        'points_debited', p_points,
        'remaining_points', v_account.available_points - p_points,
        'rupee_value', v_rupee_value
    );
END;
$$;

-- ====================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collector_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper check function for admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'state_admin') AND account_status = 'active'
    );
$$;

-- Overload is_admin(uuid) for Phase 3+ RLS compatibility
CREATE OR REPLACE FUNCTION public.is_admin(p_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_uid AND role IN ('admin', 'state_admin') AND account_status = 'active'
    );
$;

-- Helper check function for collector
CREATE OR REPLACE FUNCTION public.is_collector()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'collector' AND account_status = 'active'
    );
$$;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles: Users view their own profile" ON public.profiles;
CREATE POLICY "Profiles: Users view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles: Users update their own profile" ON public.profiles;
CREATE POLICY "Profiles: Users update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles: Admins manage all profiles" ON public.profiles;
CREATE POLICY "Profiles: Admins manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- DISTRICTS POLICIES (Public read-only)
DROP POLICY IF EXISTS "Districts: Anyone can view active districts" ON public.districts;
CREATE POLICY "Districts: Anyone can view active districts"
    ON public.districts FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Districts: Admins manage districts" ON public.districts;
CREATE POLICY "Districts: Admins manage districts"
    ON public.districts FOR ALL
    USING (public.is_admin());

-- WASTE CATEGORIES POLICIES (Public read-only)
DROP POLICY IF EXISTS "WasteCategories: Anyone view active categories" ON public.waste_categories;
CREATE POLICY "WasteCategories: Anyone view active categories"
    ON public.waste_categories FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "WasteCategories: Admins manage categories" ON public.waste_categories;
CREATE POLICY "WasteCategories: Admins manage categories"
    ON public.waste_categories FOR ALL
    USING (public.is_admin());

-- COLLECTION POINTS POLICIES
DROP POLICY IF EXISTS "CollectionPoints: Anyone can view active points" ON public.collection_points;
CREATE POLICY "CollectionPoints: Anyone can view active points"
    ON public.collection_points FOR SELECT
    USING (status = 'active' OR public.is_admin() OR public.is_collector());

DROP POLICY IF EXISTS "CollectionPoints: Admins manage points" ON public.collection_points;
CREATE POLICY "CollectionPoints: Admins manage points"
    ON public.collection_points FOR ALL
    USING (public.is_admin());

-- COLLECTOR ASSIGNMENTS POLICIES
DROP POLICY IF EXISTS "Assignments: Collectors view own assignments" ON public.collector_assignments;
CREATE POLICY "Assignments: Collectors view own assignments"
    ON public.collector_assignments FOR SELECT
    USING (collector_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Assignments: Admins manage assignments" ON public.collector_assignments;
CREATE POLICY "Assignments: Admins manage assignments"
    ON public.collector_assignments FOR ALL
    USING (public.is_admin());

-- WASTE DEPOSITS POLICIES
DROP POLICY IF EXISTS "Deposits: Citizens view own deposits" ON public.waste_deposits;
CREATE POLICY "Deposits: Citizens view own deposits"
    ON public.waste_deposits FOR SELECT
    USING (
        citizen_id = auth.uid() 
        OR public.is_admin()
        OR (public.is_collector() AND collection_point_id IN (
            SELECT collection_point_id FROM public.collector_assignments WHERE collector_id = auth.uid() AND status = 'active'
        ))
    );

DROP POLICY IF EXISTS "Deposits: Citizens insert own deposit" ON public.waste_deposits;
CREATE POLICY "Deposits: Citizens insert own deposit"
    ON public.waste_deposits FOR INSERT
    WITH CHECK (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "Deposits: Collectors update status on verification" ON public.waste_deposits;
CREATE POLICY "Deposits: Collectors update status on verification"
    ON public.waste_deposits FOR UPDATE
    USING (
        public.is_admin()
        OR (public.is_collector() AND collection_point_id IN (
            SELECT collection_point_id FROM public.collector_assignments WHERE collector_id = auth.uid() AND status = 'active'
        ))
    );

-- DEPOSIT VERIFICATIONS POLICIES
DROP POLICY IF EXISTS "Verifications: View verifications" ON public.deposit_verifications;
CREATE POLICY "Verifications: View verifications"
    ON public.deposit_verifications FOR SELECT
    USING (
        collector_id = auth.uid()
        OR public.is_admin()
        OR deposit_id IN (SELECT id FROM public.waste_deposits WHERE citizen_id = auth.uid())
    );

DROP POLICY IF EXISTS "Verifications: Collectors insert verifications" ON public.deposit_verifications;
CREATE POLICY "Verifications: Collectors insert verifications"
    ON public.deposit_verifications FOR INSERT
    WITH CHECK (
        public.is_admin() OR (public.is_collector() AND collector_id = auth.uid())
    );

-- WALLET ACCOUNTS POLICIES (Read-only for citizens, modified strictly via security definer RPCs)
DROP POLICY IF EXISTS "Wallet: Citizens read own wallet" ON public.wallet_accounts;
CREATE POLICY "Wallet: Citizens read own wallet"
    ON public.wallet_accounts FOR SELECT
    USING (citizen_id = auth.uid() OR public.is_admin());

-- WALLET TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Transactions: Citizens read own transactions" ON public.wallet_transactions;
CREATE POLICY "Transactions: Citizens read own transactions"
    ON public.wallet_transactions FOR SELECT
    USING (citizen_id = auth.uid() OR public.is_admin());

-- SUPPORT TICKETS POLICIES
DROP POLICY IF EXISTS "Tickets: Citizens view own tickets" ON public.support_tickets;
CREATE POLICY "Tickets: Citizens view own tickets"
    ON public.support_tickets FOR SELECT
    USING (citizen_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Tickets: Citizens create tickets" ON public.support_tickets;
CREATE POLICY "Tickets: Citizens create tickets"
    ON public.support_tickets FOR INSERT
    WITH CHECK (citizen_id = auth.uid());

DROP POLICY IF EXISTS "Tickets: Admins update tickets" ON public.support_tickets;
CREATE POLICY "Tickets: Admins update tickets"
    ON public.support_tickets FOR UPDATE
    USING (public.is_admin());

-- AUDIT LOGS POLICIES (Admins only)
DROP POLICY IF EXISTS "AuditLogs: Admins view audit logs" ON public.audit_logs;
CREATE POLICY "AuditLogs: Admins view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

-- ====================================================================
-- 8. STORAGE BUCKET CONFIGURATION & POLICIES
-- ====================================================================

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
('citizen-profiles', 'citizen-profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('waste-deposit-images', 'waste-deposit-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('collector-verification-images', 'collector-verification-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('support-attachments', 'support-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;
CREATE POLICY "Profile images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'citizen-profiles');

DROP POLICY IF EXISTS "Users can upload their own profile picture" ON storage.objects;
CREATE POLICY "Users can upload their own profile picture"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'citizen-profiles' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Deposit photos can be uploaded by authenticated citizens" ON storage.objects;
CREATE POLICY "Deposit photos can be uploaded by authenticated citizens"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'waste-deposit-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Deposit photos viewable by authenticated users" ON storage.objects;
CREATE POLICY "Deposit photos viewable by authenticated users"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'waste-deposit-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Verification photos uploaded by collectors" ON storage.objects;
CREATE POLICY "Verification photos uploaded by collectors"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'collector-verification-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Verification photos viewable by collectors and admins" ON storage.objects;
CREATE POLICY "Verification photos viewable by collectors and admins"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'collector-verification-images' AND auth.role() = 'authenticated');




-- >>>>>>>>>>>>>>>>>>>> PART 2: GREEN MONEY WALLET, REDEMPTIONS & RPCS (PHASE 3) <<<<<<<<<<<<<<<<<<<<
-- ====================================================================
-- CLEANTN 360 – PHASE 3 DATABASE MIGRATION
-- Green Money Rewards, Wallet & Redemption Ecosystem
-- File: supabase/migrations/20261114_phase3_green_money.sql
-- ====================================================================

-- 1. EXTEND WALLET ACCOUNTS FOR RESERVED REDEMPTION POINTS
ALTER TABLE public.wallet_accounts 
ADD COLUMN IF NOT EXISTS reserved_points INTEGER DEFAULT 0 CHECK (reserved_points >= 0);

-- 2. EXTEND WALLET TRANSACTIONS FOR AUDIT TRAIL, LEDGER BALANCES & RATES
ALTER TABLE public.wallet_transactions 
ADD COLUMN IF NOT EXISTS previous_balance INTEGER,
ADD COLUMN IF NOT EXISTS new_balance INTEGER,
ADD COLUMN IF NOT EXISTS reward_rate_used INTEGER,
ADD COLUMN IF NOT EXISTS actual_weight_kg NUMERIC(8,2);

-- Update transaction_type enum/check constraint to support Phase 3 types
DO $$
BEGIN
    ALTER TABLE public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
    ALTER TABLE public.wallet_transactions ADD CONSTRAINT wallet_transactions_type_check 
        CHECK (transaction_type IN ('deposit_reward', 'redemption', 'redemption_reversal', 'admin_adjustment'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. REDEMPTION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.redemption_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_code TEXT UNIQUE NOT NULL,
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    points_requested INTEGER NOT NULL CHECK (points_requested > 0),
    conversion_rate INTEGER NOT NULL DEFAULT 100,
    rupee_value NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'UPI', -- 'UPI', 'VOUCHER', 'DONATE'
    upi_id TEXT,
    account_details JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'reversed')),
    rejection_reason TEXT,
    processed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy queries by citizen and status
CREATE INDEX IF NOT EXISTS idx_redemption_citizen_id ON public.redemption_requests(citizen_id);
CREATE INDEX IF NOT EXISTS idx_redemption_status ON public.redemption_requests(status);
CREATE INDEX IF NOT EXISTS idx_redemption_created_at ON public.redemption_requests(created_at DESC);

-- 4. SYSTEM REWARD CONFIGURATION SETTINGS
CREATE TABLE IF NOT EXISTS public.reward_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    points_per_rupee INTEGER NOT NULL DEFAULT 100 CHECK (points_per_rupee > 0),
    min_redemption_points INTEGER NOT NULL DEFAULT 5000 CHECK (min_redemption_points >= 0),
    monthly_limit_rupees INTEGER NOT NULL DEFAULT 100 CHECK (monthly_limit_rupees > 0),
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default pilot settings if not present
INSERT INTO public.reward_settings (id, points_per_rupee, min_redemption_points, monthly_limit_rupees)
VALUES ('current', 100, 5000, 100)
ON CONFLICT (id) DO NOTHING;

-- 5. CITIZEN NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (
        type IN (
            'deposit_submitted', 
            'collector_verified', 
            'deposit_approved', 
            'deposit_rejected', 
            'redemption_requested', 
            'redemption_approved', 
            'redemption_rejected', 
            'points_restored', 
            'system_alert', 
            'info'
        )
    ),
    reference_id TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ====================================================================
-- 6. ATOMIC STORED PROCEDURES & SECURE BACKEND RPCS
-- ====================================================================

-- RPC 1: ATOMIC APPROVAL, REWARD CALCULATION & CREDITING
CREATE OR REPLACE FUNCTION public.approve_and_credit_deposit_phase3(
    p_deposit_id UUID,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deposit RECORD;
    v_verification RECORD;
    v_category RECORD;
    v_account RECORD;
    v_final_points INTEGER;
    v_rupee_value NUMERIC(10,2);
    v_admin_role user_role;
    v_prev_bal INTEGER;
    v_new_bal INTEGER;
    v_pts_per_rupee INTEGER;
    v_tx_id UUID;
BEGIN
    -- 1. Verify caller has admin privileges
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can approve deposits.';
    END IF;

    -- 2. Lock deposit record for update to prevent concurrent double-approval
    SELECT * INTO v_deposit 
    FROM public.waste_deposits 
    WHERE id = p_deposit_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deposit with ID % not found.', p_deposit_id;
    END IF;

    -- Idempotency check: Cannot approve twice or re-approve already handled deposits
    IF v_deposit.status = 'admin_approved' THEN
        RAISE EXCEPTION 'Idempotency block: Deposit % has already been approved and credited.', v_deposit.deposit_code;
    END IF;

    IF v_deposit.status != 'collector_verified' THEN
        RAISE EXCEPTION 'Invalid transition: Deposit must be verified by a collector before admin approval. Current status: %', v_deposit.status;
    END IF;

    -- 3. Fetch collector verification details
    SELECT * INTO v_verification 
    FROM public.deposit_verifications 
    WHERE deposit_id = p_deposit_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deposit verification record missing for %', p_deposit_id;
    END IF;

    -- 4. Get active reward rate for verified category
    SELECT * INTO v_category 
    FROM public.waste_categories 
    WHERE id = v_verification.verified_category_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Waste category not found.';
    END IF;

    -- Read current conversion ratio
    SELECT points_per_rupee INTO v_pts_per_rupee FROM public.reward_settings WHERE id = 'current';
    IF v_pts_per_rupee IS NULL OR v_pts_per_rupee <= 0 THEN
        v_pts_per_rupee := 100;
    END IF;

    -- 5. Calculate Points: verified actual weight * category rate
    v_final_points := ROUND(v_verification.actual_weight_kg * v_category.reward_points_per_kg);
    v_rupee_value := ROUND(v_final_points::numeric / v_pts_per_rupee::numeric, 2);

    -- 6. Lock and fetch current wallet balance
    SELECT * INTO v_account 
    FROM public.wallet_accounts 
    WHERE citizen_id = v_deposit.citizen_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        -- Auto-provision wallet if missing
        INSERT INTO public.wallet_accounts (citizen_id, available_points, lifetime_earned_points, lifetime_redeemed_points)
        VALUES (v_deposit.citizen_id, 0, 0, 0)
        RETURNING * INTO v_account;
    END IF;

    v_prev_bal := v_account.available_points;
    v_new_bal := v_prev_bal + v_final_points;

    -- 7. Credit Citizen Wallet Ledger
    UPDATE public.wallet_accounts
    SET 
        available_points = v_new_bal,
        lifetime_earned_points = lifetime_earned_points + v_final_points,
        updated_at = NOW()
    WHERE citizen_id = v_deposit.citizen_id;

    -- 8. Insert Immutable Wallet Transaction
    INSERT INTO public.wallet_transactions (
        citizen_id,
        deposit_id,
        transaction_type,
        points,
        conversion_value,
        previous_balance,
        new_balance,
        reward_rate_used,
        actual_weight_kg,
        description,
        status
    ) VALUES (
        v_deposit.citizen_id,
        p_deposit_id,
        'deposit_reward',
        v_final_points,
        v_rupee_value,
        v_prev_bal,
        v_new_bal,
        v_category.reward_points_per_kg,
        v_verification.actual_weight_kg,
        FORMAT('Deposit %s: %s kg of %s approved (@%s pts/kg)', v_deposit.deposit_code, v_verification.actual_weight_kg, v_category.category_name, v_category.reward_points_per_kg),
        'completed'
    ) RETURNING id INTO v_tx_id;

    -- 9. Update deposit status & record approved points
    UPDATE public.waste_deposits
    SET 
        status = 'admin_approved',
        approved_by = p_admin_id,
        approved_at = NOW(),
        approved_points = v_final_points
    WHERE id = p_deposit_id;

    -- 10. Create Notification for citizen
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        reference_id
    ) VALUES (
        v_deposit.citizen_id,
        'Green Money Points Credited! 🎉',
        FORMAT('Your deposit %s of %s kg %s was approved. +%s Green Money Points (₹%s) credited to your wallet.', v_deposit.deposit_code, v_verification.actual_weight_kg, v_category.category_name, v_final_points, v_rupee_value),
        'deposit_approved',
        v_deposit.deposit_code
    );

    -- 11. Audit log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
        p_admin_id, 
        'APPROVE_DEPOSIT_REWARD', 
        'waste_deposits', 
        p_deposit_id, 
        jsonb_build_object(
            'deposit_code', v_deposit.deposit_code,
            'points_credited', v_final_points,
            'rupee_value', v_rupee_value,
            'verified_weight_kg', v_verification.actual_weight_kg,
            'rate_used', v_category.reward_points_per_kg,
            'previous_balance', v_prev_bal,
            'new_balance', v_new_bal
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'deposit_id', p_deposit_id,
        'deposit_code', v_deposit.deposit_code,
        'points_credited', v_final_points,
        'rupee_value', v_rupee_value,
        'new_balance', v_new_bal
    );
END;
$$;

-- RPC 2: CITIZEN REDEMPTION REQUEST (RESERVE POINTS)
CREATE OR REPLACE FUNCTION public.request_redemption_phase3(
    p_citizen_id UUID,
    p_points INTEGER,
    p_upi_id TEXT,
    p_payment_method TEXT DEFAULT 'UPI'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account RECORD;
    v_settings RECORD;
    v_rupee_val NUMERIC(10,2);
    v_req_code TEXT;
    v_req_id UUID;
    v_prev_bal INTEGER;
    v_new_bal INTEGER;
    v_current_month_redeemed NUMERIC(10,2);
BEGIN
    IF p_points <= 0 THEN
        RAISE EXCEPTION 'Redemption points must be greater than zero.';
    END IF;

    -- Fetch settings
    SELECT * INTO v_settings FROM public.reward_settings WHERE id = 'current';
    IF v_settings IS NULL THEN
        v_settings.points_per_rupee := 100;
        v_settings.min_redemption_points := 5000;
        v_settings.monthly_limit_rupees := 100;
    END IF;

    -- Validate minimum points threshold
    IF p_points < v_settings.min_redemption_points THEN
        RAISE EXCEPTION 'Minimum redemption threshold is % points (₹%). You requested % points.', 
            v_settings.min_redemption_points, 
            ROUND(v_settings.min_redemption_points::numeric / v_settings.points_per_rupee::numeric, 2),
            p_points;
    END IF;

    -- Lock and check wallet balance
    SELECT * INTO v_account 
    FROM public.wallet_accounts 
    WHERE citizen_id = p_citizen_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet account not found for citizen %.', p_citizen_id;
    END IF;

    IF v_account.available_points < p_points THEN
        RAISE EXCEPTION 'Insufficient points balance. Available: %, Requested: %', v_account.available_points, p_points;
    END IF;

    v_rupee_val := ROUND(p_points::numeric / v_settings.points_per_rupee::numeric, 2);

    -- Monthly redemption cap check
    SELECT COALESCE(SUM(rupee_value), 0) INTO v_current_month_redeemed
    FROM public.redemption_requests
    WHERE citizen_id = p_citizen_id
      AND status IN ('pending', 'completed')
      AND created_at >= date_trunc('month', NOW());

    IF (v_current_month_redeemed + v_rupee_val) > v_settings.monthly_limit_rupees THEN
        RAISE EXCEPTION 'Monthly redemption limit reached (₹% max per month). Already requested this month: ₹%, Requested: ₹%',
            v_settings.monthly_limit_rupees, v_current_month_redeemed, v_rupee_val;
    END IF;

    v_prev_bal := v_account.available_points;
    v_new_bal := v_prev_bal - p_points;

    -- Reserve points: deduct from available, add to reserved
    UPDATE public.wallet_accounts
    SET 
        available_points = v_new_bal,
        reserved_points = COALESCE(reserved_points, 0) + p_points,
        updated_at = NOW()
    WHERE citizen_id = p_citizen_id;

    v_req_code := 'RED-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');

    -- Insert redemption request
    INSERT INTO public.redemption_requests (
        request_code,
        citizen_id,
        points_requested,
        conversion_rate,
        rupee_value,
        payment_method,
        upi_id,
        status
    ) VALUES (
        v_req_code,
        p_citizen_id,
        p_points,
        v_settings.points_per_rupee,
        v_rupee_val,
        COALESCE(p_payment_method, 'UPI'),
        p_upi_id,
        'pending'
    ) RETURNING id INTO v_req_id;

    -- Record pending transaction
    INSERT INTO public.wallet_transactions (
        citizen_id,
        transaction_type,
        points,
        conversion_value,
        previous_balance,
        new_balance,
        description,
        status
    ) VALUES (
        p_citizen_id,
        'redemption',
        -p_points,
        v_rupee_val,
        v_prev_bal,
        v_new_bal,
        FORMAT('Redemption Request %s (Simulated %s to %s) - Pending Admin Approval', v_req_code, p_payment_method, p_upi_id),
        'pending'
    );

    -- Notify Citizen
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        reference_id
    ) VALUES (
        p_citizen_id,
        'Redemption Request Submitted ⏳',
        FORMAT('Your request %s to redeem %s points (₹%s) via %s is submitted and awaiting admin approval. %s points are reserved.', v_req_code, p_points, v_rupee_val, p_payment_method, p_points),
        'redemption_requested',
        v_req_code
    );

    RETURN jsonb_build_object(
        'success', true,
        'request_id', v_req_id,
        'request_code', v_req_code,
        'points_reserved', p_points,
        'rupee_value', v_rupee_val,
        'available_balance', v_new_bal
    );
END;
$$;

-- RPC 3: ADMIN PROCESS REDEMPTION (APPROVE OR REJECT WITH REVERSAL)
CREATE OR REPLACE FUNCTION public.process_redemption_phase3(
    p_redemption_id UUID,
    p_admin_id UUID,
    p_action TEXT, -- 'approve' or 'reject'
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_role user_role;
    v_req RECORD;
    v_account RECORD;
    v_prev_bal INTEGER;
    v_new_bal INTEGER;
BEGIN
    -- 1. Verify caller has admin privileges
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can process redemptions.';
    END IF;

    -- 2. Lock redemption request
    SELECT * INTO v_req
    FROM public.redemption_requests
    WHERE id = p_redemption_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Redemption request % not found.', p_redemption_id;
    END IF;

    IF v_req.status != 'pending' THEN
        RAISE EXCEPTION 'Redemption request % has already been processed (Status: %).', v_req.request_code, v_req.status;
    END IF;

    -- 3. Lock citizen wallet
    SELECT * INTO v_account 
    FROM public.wallet_accounts 
    WHERE citizen_id = v_req.citizen_id 
    FOR UPDATE;

    IF p_action = 'approve' THEN
        -- Approval: Release reserved points and record lifetime redeemed points
        UPDATE public.wallet_accounts
        SET 
            reserved_points = GREATEST(0, COALESCE(reserved_points, 0) - v_req.points_requested),
            lifetime_redeemed_points = lifetime_redeemed_points + v_req.points_requested,
            updated_at = NOW()
        WHERE citizen_id = v_req.citizen_id;

        -- Update redemption record
        UPDATE public.redemption_requests
        SET 
            status = 'completed',
            processed_by = p_admin_id,
            processed_at = NOW()
        WHERE id = p_redemption_id;

        -- Update transaction status to completed
        UPDATE public.wallet_transactions
        SET status = 'completed'
        WHERE citizen_id = v_req.citizen_id 
          AND transaction_type = 'redemption'
          AND description LIKE '%' || v_req.request_code || '%';

        -- Notify citizen
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            reference_id
        ) VALUES (
            v_req.citizen_id,
            'Redemption Approved & Paid! 💰',
            FORMAT('Your redemption %s for %s points (₹%s) via %s (%s) has been approved and simulated payout completed.', v_req.request_code, v_req.points_requested, v_req.rupee_value, v_req.payment_method, v_req.upi_id),
            'redemption_approved',
            v_req.request_code
        );

        -- Audit log
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (
            p_admin_id, 
            'APPROVE_REDEMPTION', 
            'redemption_requests', 
            p_redemption_id, 
            jsonb_build_object(
                'request_code', v_req.request_code,
                'points', v_req.points_requested,
                'rupee_value', v_req.rupee_value,
                'citizen_id', v_req.citizen_id
            )
        );

        RETURN jsonb_build_object('success', true, 'status', 'completed', 'request_code', v_req.request_code);

    ELSIF p_action = 'reject' THEN
        IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
            RAISE EXCEPTION 'A valid rejection reason is required to reject a redemption request.';
        END IF;

        v_prev_bal := v_account.available_points;
        v_new_bal := v_prev_bal + v_req.points_requested;

        -- Reversal: Restore reserved points back to available points
        UPDATE public.wallet_accounts
        SET 
            available_points = v_new_bal,
            reserved_points = GREATEST(0, COALESCE(reserved_points, 0) - v_req.points_requested),
            updated_at = NOW()
        WHERE citizen_id = v_req.citizen_id;

        -- Update redemption record
        UPDATE public.redemption_requests
        SET 
            status = 'rejected',
            rejection_reason = p_reason,
            processed_by = p_admin_id,
            processed_at = NOW()
        WHERE id = p_redemption_id;

        -- Update pending transaction
        UPDATE public.wallet_transactions
        SET status = 'rejected'
        WHERE citizen_id = v_req.citizen_id 
          AND transaction_type = 'redemption'
          AND description LIKE '%' || v_req.request_code || '%';

        -- Create Reversal Transaction Entry (Permanent Audit Record)
        INSERT INTO public.wallet_transactions (
            citizen_id,
            transaction_type,
            points,
            conversion_value,
            previous_balance,
            new_balance,
            description,
            status
        ) VALUES (
            v_req.citizen_id,
            'redemption_reversal',
            v_req.points_requested,
            v_req.rupee_value,
            v_prev_bal,
            v_new_bal,
            FORMAT('Reversal of Redemption %s: +%s points restored. Reason: %s', v_req.request_code, v_req.points_requested, p_reason),
            'completed'
        );

        -- Notify citizen of restoration
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            reference_id
        ) VALUES (
            v_req.citizen_id,
            'Redemption Rejected – Points Restored 🔄',
            FORMAT('Your redemption %s for %s points was rejected by the administration. Reason: "%s". %s points have been restored to your available balance.', v_req.request_code, v_req.points_requested, p_reason, v_req.points_requested),
            'points_restored',
            v_req.request_code
        );

        -- Audit log
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (
            p_admin_id, 
            'REJECT_REDEMPTION_RESTORE', 
            'redemption_requests', 
            p_redemption_id, 
            jsonb_build_object(
                'request_code', v_req.request_code,
                'points_restored', v_req.points_requested,
                'reason', p_reason,
                'citizen_id', v_req.citizen_id
            )
        );

        RETURN jsonb_build_object('success', true, 'status', 'rejected', 'request_code', v_req.request_code, 'points_restored', v_req.points_requested);

    ELSE
        RAISE EXCEPTION 'Invalid action: %. Must be either approve or reject.', p_action;
    END IF;
END;
$$;

-- ====================================================================
-- 7. ROW LEVEL SECURITY (RLS) FOR PHASE 3 TABLES
-- ====================================================================

ALTER TABLE public.redemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Redemption Requests RLS
DROP POLICY IF EXISTS "Citizens can view own redemptions" ON public.redemption_requests;
CREATE POLICY "Citizens can view own redemptions" 
ON public.redemption_requests FOR SELECT 
TO authenticated 
USING (citizen_id = auth.uid());

DROP POLICY IF EXISTS "Citizens can insert own redemption requests" ON public.redemption_requests;
CREATE POLICY "Citizens can insert own redemption requests" 
ON public.redemption_requests FOR INSERT 
TO authenticated 
WITH CHECK (citizen_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to redemption requests" ON public.redemption_requests;
CREATE POLICY "Admins have full access to redemption requests" 
ON public.redemption_requests FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()));

-- Reward Settings RLS
DROP POLICY IF EXISTS "Everyone can read reward settings" ON public.reward_settings;
CREATE POLICY "Everyone can read reward settings" 
ON public.reward_settings FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Admins can update reward settings" ON public.reward_settings;
CREATE POLICY "Admins can update reward settings" 
ON public.reward_settings FOR UPDATE 
TO authenticated 
USING (public.is_admin(auth.uid()));

-- Notifications RLS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to notifications" ON public.notifications;
CREATE POLICY "Admins have full access to notifications" 
ON public.notifications FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()));




-- >>>>>>>>>>>>>>>>>>>> PART 3: 38 DISTRICTS GIS, CPCB IMPACT & GREEN SCORE (PHASE 4) <<<<<<<<<<<<<<<<<<<<
-- ====================================================================
-- CLEANTN 360 - PHASE 4 DATABASE MIGRATION
-- TAMIL NADU SMART WASTE INTELLIGENCE, GIS MAPPING & ENVIRONMENTAL IMPACT
-- ====================================================================

-- 1. user_role ENUM already includes 'state_admin' from Master Initialization above.

-- 2. TABLE: district_metadata (Official 38 Districts Directory)
CREATE TABLE IF NOT EXISTS public.district_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_code TEXT UNIQUE NOT NULL, -- e.g. 'TN-CBE'
    district_name TEXT UNIQUE NOT NULL, -- e.g. 'Coimbatore'
    zone TEXT NOT NULL CHECK (zone IN ('Northern', 'Western', 'Central', 'Southern')),
    headquarters TEXT NOT NULL,
    area_sqkm NUMERIC(10,2) NOT NULL,
    population_census_2011 BIGINT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_pilot BOOLEAN NOT NULL DEFAULT false,
    data_status TEXT NOT NULL DEFAULT 'standby' CHECK (data_status IN ('verified_pilot', 'pilot', 'standby')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE: district_admins (State Admin District Delegations)
CREATE TABLE IF NOT EXISTS public.district_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    district_code TEXT NOT NULL REFERENCES public.district_metadata(district_code) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, district_code)
);

-- 4. TABLE: environmental_factors (Documented CPCB & IPCC Factors)
CREATE TABLE IF NOT EXISTS public.environmental_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name TEXT UNIQUE NOT NULL,
    co2_offset_per_kg NUMERIC(6,3) NOT NULL,
    landfill_saved_m3_per_kg NUMERIC(8,5) NOT NULL,
    raw_material_saved_kg_per_kg NUMERIC(6,3) NOT NULL,
    trees_saved_per_kg NUMERIC(8,5) DEFAULT 0,
    water_saved_liters_per_kg NUMERIC(8,2) DEFAULT 0,
    energy_saved_kwh_per_kg NUMERIC(8,2) DEFAULT 0,
    source_reference TEXT NOT NULL,
    methodology_description TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '2026.1-CPCB-TN',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLE: district_green_scores (Parametric Performance Index)
CREATE TABLE IF NOT EXISTS public.district_green_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_code TEXT NOT NULL REFERENCES public.district_metadata(district_code) ON DELETE CASCADE,
    collection_score NUMERIC(5,2) NOT NULL DEFAULT 0, -- Weight: 25%
    recycling_score NUMERIC(5,2) NOT NULL DEFAULT 0,  -- Weight: 25%
    participation_score NUMERIC(5,2) NOT NULL DEFAULT 0, -- Weight: 20%
    coverage_score NUMERIC(5,2) NOT NULL DEFAULT 0, -- Weight: 15%
    verification_score NUMERIC(5,2) NOT NULL DEFAULT 0, -- Weight: 15%
    total_score NUMERIC(5,2) NOT NULL DEFAULT 0,    -- 0 - 100
    performance_label TEXT NOT NULL DEFAULT 'Insufficient Data' CHECK (performance_label IN ('Excellent', 'Good', 'Improving', 'Needs Attention', 'Insufficient Data')),
    is_sufficient_data BOOLEAN NOT NULL DEFAULT false,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(district_code, calculated_at)
);

-- 6. TABLE: data_sources (Dataset Governance & Provenance)
CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name TEXT NOT NULL,
    source_url TEXT,
    coverage TEXT NOT NULL DEFAULT 'Tamil Nadu',
    reporting_period TEXT NOT NULL,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'provisional', 'unverified')),
    classification TEXT NOT NULL CHECK (classification IN ('official', 'pilot', 'imported_historical', 'estimated', 'user_operational')),
    record_count INTEGER NOT NULL DEFAULT 0,
    imported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Add GIS Columns to existing collection_points if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'collection_points' AND column_name = 'assigned_collector'
    ) THEN
        ALTER TABLE public.collection_points ADD COLUMN assigned_collector TEXT;
    END IF;
END$$;

-- 8. Seed CPCB Environmental Emission Factors
INSERT INTO public.environmental_factors (category_name, co2_offset_per_kg, landfill_saved_m3_per_kg, raw_material_saved_kg_per_kg, trees_saved_per_kg, water_saved_liters_per_kg, energy_saved_kwh_per_kg, source_reference, methodology_description)
VALUES
    ('Plastic', 1.500, 0.00220, 1.200, 0, 10.0, 2.50, 'Central Pollution Control Board (CPCB) EPR Guidelines', 'Avoided production of virgin fossil-based polymer resins through circular mechanical recycling loop.'),
    ('Paper', 1.100, 0.00180, 1.000, 0.01700, 26.0, 1.80, 'IPMA & CPCB Circular Economy Standards', 'Reduction of virgin logging, kraft chemical digesting, and prevention of anaerobic landfill decomposition.'),
    ('Metal', 2.000, 0.00080, 1.400, 0, 15.0, 6.20, 'Ministry of Steel (India) Scrap Recycling Policy', 'Secondary electric arc remelting substituting energy-intensive blast furnace bauxite and iron smelting.'),
    ('Glass', 0.310, 0.00070, 1.200, 0, 2.5, 0.45, 'Federation of Indian Glass Manufacturers & FEVE', 'Closed-loop cullet remelting lowering furnace temperatures and preventing carbonate emissions.'),
    ('Organic', 0.520, 0.00150, 0.350, 0, 4.0, 0.20, 'Swachh Bharat Mission (Urban) Solid Waste Manual', 'Aerobic municipal composting preventing anaerobic methanogenesis in open dumps.'),
    ('E-Waste', 3.200, 0.00120, 0.800, 0, 0, 9.50, 'E-Waste (Management) Rules 2022 & CPCB', 'Urban mining and hydrometallurgical refining recovering critical minerals and diverting toxic heavy metals.')
ON CONFLICT (category_name) DO UPDATE SET
    co2_offset_per_kg = EXCLUDED.co2_offset_per_kg,
    source_reference = EXCLUDED.source_reference,
    updated_at = NOW();

-- 9. Seed Tamil Nadu 38 Districts Master Records
INSERT INTO public.district_metadata (district_code, district_name, zone, headquarters, area_sqkm, population_census_2011, latitude, longitude, is_pilot, data_status, description)
VALUES
    ('TN-ARI', 'Ariyalur', 'Central', 'Ariyalur', 1949, 754894, 11.1396, 79.0759, false, 'standby', 'Mineral and cement limestone deposits in the Kollidam basin.'),
    ('TN-CGL', 'Chengalpattu', 'Northern', 'Chengalpattu', 2945, 2556244, 12.6939, 79.9757, false, 'standby', 'Industrial and tech hub neighboring Chennai metropolitan area.'),
    ('TN-CHN', 'Chennai', 'Northern', 'Chennai', 426, 7088403, 13.0827, 80.2707, true, 'pilot', 'Capital city and primary metropolitan economic engine.'),
    ('TN-CBE', 'Coimbatore', 'Western', 'Coimbatore', 4723, 3458045, 11.0168, 76.9558, true, 'verified_pilot', 'Primary operational pilot district with live digital scale hubs.'),
    ('TN-CUD', 'Cuddalore', 'Northern', 'Cuddalore', 3678, 2605914, 11.7480, 79.7714, false, 'standby', 'Coastal district with Silver Beach, Neyveli lignite and ports.'),
    ('TN-DPI', 'Dharmapuri', 'Western', 'Dharmapuri', 4497, 1506843, 12.1357, 78.1584, false, 'standby', 'Hogenakkal falls and extensive mango horticulture.'),
    ('TN-DGL', 'Dindigul', 'Southern', 'Dindigul', 6266, 2159775, 10.3673, 77.9803, false, 'standby', 'Famous for locks, leather, and Kodaikanal hill station.'),
    ('TN-ERD', 'Erode', 'Western', 'Erode', 5722, 2251744, 11.3410, 77.7172, false, 'standby', 'Turmeric City and handloom textile center.'),
    ('TN-KLK', 'Kallakurichi', 'Northern', 'Kallakurichi', 3520, 1370281, 11.7384, 78.9639, false, 'standby', 'Agricultural hub at the base of Kalvarayan Hills.'),
    ('TN-KCH', 'Kancheepuram', 'Northern', 'Kancheepuram', 1655, 1166401, 12.8342, 79.7036, false, 'standby', 'City of Thousand Temples and traditional silk sarees.'),
    ('TN-KKM', 'Kanniyakumari', 'Southern', 'Nagercoil', 1672, 1870374, 8.0883, 77.5385, false, 'standby', 'Southernmost confluence of three oceans.'),
    ('TN-KRR', 'Karur', 'Central', 'Karur', 2895, 1064493, 10.9601, 78.0766, false, 'standby', 'Textile export and bus bodybuilding hub on Amaravathi river.'),
    ('TN-KGI', 'Krishnagiri', 'Western', 'Krishnagiri', 5143, 1879809, 12.5186, 78.2137, false, 'standby', 'Hosur industrial corridor and mango farming.'),
    ('TN-MDU', 'Madurai', 'Southern', 'Madurai', 3741, 3038252, 9.9252, 78.1198, true, 'pilot', 'Cultural capital and ancient temple city on Vaigai river.'),
    ('TN-MYL', 'Mayiladuthurai', 'Central', 'Mayiladuthurai', 1172, 918356, 11.1075, 79.6522, false, 'standby', 'Cauvery delta heritage shrines and agrarian fields.'),
    ('TN-NGP', 'Nagapattinam', 'Central', 'Nagapattinam', 1397, 697069, 10.7672, 79.8449, false, 'standby', 'Coastal fishing hub, Velankanni and Nagore pilgrimage.'),
    ('TN-NMK', 'Namakkal', 'Western', 'Namakkal', 3368, 1726601, 11.2189, 78.1674, false, 'standby', 'Transport and poultry hub with Kolli Hills.'),
    ('TN-NLG', 'Nilgiris', 'Western', 'Udhagamandalam', 2549, 735394, 11.4102, 76.6950, false, 'standby', 'Fragile Western Ghats biosphere and high-altitude tea gardens.'),
    ('TN-PBL', 'Perambalur', 'Central', 'Perambalur', 1756, 565223, 11.2342, 78.8820, false, 'standby', 'Shallot (small onion) and maize agricultural district.'),
    ('TN-PDK', 'Pudukkottai', 'Central', 'Pudukkottai', 4663, 1618345, 10.3797, 78.8208, false, 'standby', 'Princely heritage and Sittannavasal cave murals.'),
    ('TN-RMD', 'Ramanathapuram', 'Southern', 'Ramanathapuram', 4104, 1353445, 9.3639, 78.8395, false, 'standby', 'Pamban bridge, Rameswaram, and Gulf of Mannar.'),
    ('TN-RNP', 'Ranipet', 'Northern', 'Ranipet', 2234, 1210277, 12.9272, 79.3330, false, 'standby', 'Leather tanning and engineering industries.'),
    ('TN-SLM', 'Salem', 'Western', 'Salem', 5205, 3482056, 11.6643, 78.1460, false, 'standby', 'Steel city, magnesite deposits, and mango belt.'),
    ('TN-SVG', 'Sivaganga', 'Southern', 'Sivaganga', 4189, 1339101, 9.8433, 78.4809, false, 'standby', 'Chettinad cultural mansions, cuisine, and heritage temples.'),
    ('TN-TSI', 'Tenkasi', 'Southern', 'Tenkasi', 2916, 1407627, 8.9594, 77.3151, false, 'standby', 'Courtallam waterfalls and fertile Western Ghats base.'),
    ('TN-TNJ', 'Thanjavur', 'Central', 'Thanjavur', 3411, 2405890, 10.7870, 79.1378, false, 'standby', 'Rice Bowl of Tamil Nadu and Great Living Chola Temples.'),
    ('TN-THN', 'Theni', 'Southern', 'Theni', 2889, 1245964, 10.0104, 77.4768, false, 'standby', 'Picturesque valley, cardamom, and spice gateway.'),
    ('TN-TUT', 'Thoothukudi', 'Southern', 'Thoothukudi', 4707, 1750176, 8.7642, 78.1348, false, 'standby', 'Pearl City with major sea port and chemical industries.'),
    ('TN-TRY', 'Tiruchirappalli', 'Central', 'Tiruchirappalli', 4404, 2722290, 10.7905, 78.7047, false, 'standby', 'Geographical center of TN, Rockfort, and heavy engineering.'),
    ('TN-TNV', 'Tirunelveli', 'Southern', 'Tirunelveli', 3842, 1665253, 8.7139, 77.7567, false, 'standby', 'Thamirabarani river basin and academic hub.'),
    ('TN-TPR', 'Tirupathur', 'Northern', 'Tirupathur', 1792, 1111812, 12.4958, 78.5678, false, 'standby', 'Yelagiri hills and sandalwood reserve.'),
    ('TN-UPR', 'Tiruppur', 'Western', 'Tiruppur', 5187, 2479052, 11.1085, 77.3411, false, 'standby', 'Knitwear and textile export powerhouse.'),
    ('TN-TLR', 'Tiruvallur', 'Northern', 'Tiruvallur', 3422, 3728104, 13.1432, 79.9079, false, 'standby', 'Automobile corridor and Pulicat wetland.'),
    ('TN-TVM', 'Tiruvannamalai', 'Northern', 'Tiruvannamalai', 6191, 2464875, 12.2253, 79.0747, false, 'standby', 'Sacred Annamalaiyar hill and agrarian weaving.'),
    ('TN-TVR', 'Tiruvarur', 'Central', 'Tiruvarur', 2097, 1264277, 10.7725, 79.6365, false, 'standby', 'Thyagaraja temple chariot and Carnatic heritage.'),
    ('TN-VEL', 'Vellore', 'Northern', 'Vellore', 2036, 1614242, 12.9165, 79.1325, false, 'standby', 'Historic stone fort, CMC, and leather industries.'),
    ('TN-VPM', 'Viluppuram', 'Northern', 'Viluppuram', 3725, 2093003, 11.9401, 79.4861, false, 'standby', 'Gingee rock fort and central highway corridor.'),
    ('TN-VDR', 'Virudhunagar', 'Southern', 'Virudhunagar', 4288, 1942288, 9.5680, 77.9624, false, 'standby', 'National printing, matchbox, and Sivakasi industries.')
ON CONFLICT (district_code) DO UPDATE SET
    data_status = EXCLUDED.data_status,
    description = EXCLUDED.description;

-- 10. Row Level Security Policies for Phase 4
ALTER TABLE public.district_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_green_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_admins ENABLE ROW LEVEL SECURITY;

-- Read policies: District metadata and environmental factors are publicly readable
DROP POLICY IF EXISTS "Public can view district metadata" ON public.district_metadata;
CREATE POLICY "Public can view district metadata" ON public.district_metadata FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view environmental factors" ON public.environmental_factors;
CREATE POLICY "Public can view environmental factors" ON public.environmental_factors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view green scores" ON public.district_green_scores;
CREATE POLICY "Public can view green scores" ON public.district_green_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view data sources" ON public.data_sources;
CREATE POLICY "Public can view data sources" ON public.data_sources FOR SELECT USING (true);

-- Admin & State Admin manage policies
DROP POLICY IF EXISTS "State Admin full access on district_metadata" ON public.district_metadata;
CREATE POLICY "State Admin full access on district_metadata" ON public.district_metadata
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'state_admin')
    );

DROP POLICY IF EXISTS "State Admin full access on district_admins" ON public.district_admins;
CREATE POLICY "State Admin full access on district_admins" ON public.district_admins
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'state_admin')
    );

DROP POLICY IF EXISTS "State Admin full access on data_sources" ON public.data_sources;
CREATE POLICY "State Admin full access on data_sources" ON public.data_sources
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('state_admin', 'admin'))
    );



-- >>>>>>>>>>>>>>>>>>>> PART 4: AI ASSISTANT, FORECASTS, ROUTES, FRAUD & GAMIFICATION (PHASE 5) <<<<<<<<<<<<<<<<<<<<
-- ==============================================================================
-- CLEANTN 360 – PHASE 5 DATABASE MIGRATION
-- AI-Powered Smart Waste Management, Predictive Analytics, Route Optimization,
-- Automated Alerts, Fraud Detection, Gamification & IoT Readiness
-- Migration: 20261117_phase5_ai_automation.sql
-- ==============================================================================

-- 1. AI CONVERSATIONS & RBAC AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_title VARCHAR(255) NOT NULL DEFAULT 'Waste Intelligence Chat',
    user_role VARCHAR(50) NOT NULL,
    district_code VARCHAR(20) DEFAULT 'TN-CBE',
    language VARCHAR(10) DEFAULT 'en', -- 'en' or 'ta'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    sources_cited JSONB DEFAULT '[]'::jsonb,
    sql_intent_detected VARCHAR(100),
    data_classification VARCHAR(50) DEFAULT 'aggregated_public',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PREDICTIVE WASTE ANALYTICS & MODEL REGISTRY
CREATE TABLE IF NOT EXISTS public.forecast_model_versions (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'v5.2.1-TN-Ensemble'
    model_name VARCHAR(100) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    trained_on_period VARCHAR(100) NOT NULL,
    training_records_count INTEGER NOT NULL,
    mae_score NUMERIC(10, 3) NOT NULL,
    rmse_score NUMERIC(10, 3) NOT NULL,
    r2_score NUMERIC(6, 4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waste_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code) ON DELETE CASCADE,
    model_version_id VARCHAR(50) REFERENCES public.forecast_model_versions(id),
    target_category VARCHAR(50) NOT NULL, -- 'All', 'Plastic', 'Paper', etc.
    forecast_date DATE NOT NULL,
    predicted_weight_kg NUMERIC(12, 2) NOT NULL,
    confidence_lower_kg NUMERIC(12, 2),
    confidence_upper_kg NUMERIC(12, 2),
    actual_weight_kg NUMERIC(12, 2), -- filled once actual records arrive
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SMART COLLECTION ROUTE OPTIMIZATION
CREATE TABLE IF NOT EXISTS public.collection_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name VARCHAR(255) NOT NULL,
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    assigned_collector_id UUID REFERENCES public.profiles(id),
    start_depot_name VARCHAR(255) NOT NULL,
    start_lat NUMERIC(10, 6) NOT NULL,
    start_lng NUMERIC(10, 6) NOT NULL,
    total_distance_km NUMERIC(8, 2) NOT NULL,
    estimated_duration_mins INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('draft', 'assigned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES public.collection_routes(id) ON DELETE CASCADE,
    collection_point_id UUID REFERENCES public.collection_points(id),
    sequence_order INTEGER NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    estimated_fill_percent INTEGER DEFAULT 50,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reached', 'collected', 'skipped')),
    collected_weight_kg NUMERIC(10, 2),
    collector_notes TEXT,
    completed_at TIMESTAMPTZ
);

-- 4. SMART ALERTS & AUTOMATION ENGINE
CREATE TABLE IF NOT EXISTS public.notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    event_trigger VARCHAR(100) NOT NULL,
    condition_threshold VARCHAR(255),
    channels JSONB NOT NULL DEFAULT '["in_app"]'::jsonb, -- e.g. ["in_app", "email", "sms", "whatsapp"]
    target_role VARCHAR(50) NOT NULL, -- 'admin', 'collector', 'citizen', 'state_admin'
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.notification_rules(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    recipient_user_id UUID REFERENCES public.profiles(id),
    channel VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    delivery_status VARCHAR(50) DEFAULT 'delivered' CHECK (delivery_status IN ('queued', 'delivered', 'failed', 'retrying')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FRAUD DETECTION & SMART VERIFICATION
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_id UUID REFERENCES public.waste_deposits(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES public.profiles(id),
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_tier VARCHAR(20) NOT NULL CHECK (risk_tier IN ('low', 'medium', 'high', 'critical')),
    triggered_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_payload JSONB DEFAULT '{}'::jsonb,
    investigation_status VARCHAR(50) DEFAULT 'pending_review' CHECK (investigation_status IN ('pending_review', 'verified_legitimate', 'disputed', 'dismissed')),
    admin_reviewer_id UUID REFERENCES public.profiles(id),
    admin_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CITIZEN GAMIFICATION & GREEN COMMUNITY
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'first_deposit', 'plastic_champion'
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    points_awarded INTEGER DEFAULT 50,
    criteria_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS public.citizen_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(citizen_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.community_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    target_category VARCHAR(50) DEFAULT 'All',
    target_weight_kg NUMERIC(10, 2) NOT NULL,
    current_weight_kg NUMERIC(10, 2) DEFAULT 0,
    bonus_points_pool INTEGER DEFAULT 10000,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES public.community_challenges(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    contributed_weight_kg NUMERIC(10, 2) DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, citizen_id)
);

-- 7. AI ADMIN DECISION SUPPORT RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    category VARCHAR(50) NOT NULL, -- 'Expansion', 'Demand', 'Collector', 'Data_Quality', 'Recycling'
    description TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    supporting_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_period VARCHAR(100) DEFAULT 'Q4 2026',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'under_review')),
    admin_response TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. OPTIONAL IOT INTEGRATION READINESS
CREATE TABLE IF NOT EXISTS public.device_registry (
    device_id VARCHAR(50) PRIMARY KEY,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('smart_bin_sonar', 'digital_scale', 'gps_tracker', 'solar_hub_telemetry')),
    collection_point_id UUID REFERENCES public.collection_points(id),
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    hardware_model VARCHAR(100),
    firmware_version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'standby' CHECK (status IN ('active', 'standby', 'maintenance', 'offline')),
    last_ping_at TIMESTAMPTZ,
    installed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.device_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(50) REFERENCES public.device_registry(device_id) ON DELETE CASCADE,
    reading_type VARCHAR(50) NOT NULL, -- 'fill_level_percent', 'weight_kg', 'battery_volts', 'temperature_c'
    numeric_value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow public read on achievements and community challenges
DROP POLICY IF EXISTS "Public Read Community Challenges" ON public.community_challenges;
CREATE POLICY "Public Read Community Challenges" ON public.community_challenges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read Achievements" ON public.citizen_achievements;
CREATE POLICY "Public Read Achievements" ON public.citizen_achievements FOR SELECT USING (true);

-- Allow admins full access on recommendations, fraud alerts, routes, and notifications
DROP POLICY IF EXISTS "Admin All Access AI Recs" ON public.ai_recommendations;
CREATE POLICY "Admin All Access AI Recs" ON public.ai_recommendations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'state_admin'))
);

DROP POLICY IF EXISTS "Admin All Access Fraud" ON public.fraud_alerts;
CREATE POLICY "Admin All Access Fraud" ON public.fraud_alerts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'state_admin'))
);

DROP POLICY IF EXISTS "Collector and Admin Routes" ON public.collection_routes;
CREATE POLICY "Collector and Admin Routes" ON public.collection_routes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('collector', 'admin', 'state_admin'))
);



-- >>>>>>>>>>>>>>>>>>>> PART 5: IOT FLEET, GPS VEHICLES, GOV SYNC, RECYCLERS, PAYOUTS & ROLLOUT (PHASE 6) <<<<<<<<<<<<<<<<<<<<
-- ==============================================================================
-- CLEANTN 360 – PHASE 6 PRODUCTION & STATEWIDE EXPANSION MIGRATION
-- Real-World IoT Waste Management, Live GPS Vehicle Fleet Tracking,
-- Government/Municipal Integrations, Recycler Marketplace, Real Payout Ready,
-- Community Awareness Network, Advanced Security Audit & 38-District Rollout
-- Migration: 20261117_phase6_production_statewide.sql
-- ==============================================================================

-- 1. EXTENDED IOT DEVICES & TELEMETRY STREAM
CREATE TABLE IF NOT EXISTS public.iot_device_fleet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'CTN-IOT-SONAR-01'
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('smart_bin_sonar', 'digital_scale', 'gps_telematics', 'solar_hub_kiosk')),
    collection_point_id UUID REFERENCES public.collection_points(id) ON DELETE SET NULL,
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    hardware_model VARCHAR(100) NOT NULL,
    firmware_version VARCHAR(50) NOT NULL,
    auth_token_hash VARCHAR(255) NOT NULL,
    battery_percent INTEGER DEFAULT 100,
    fill_level_percent INTEGER DEFAULT 0,
    connectivity_status VARCHAR(30) DEFAULT 'online' CHECK (connectivity_status IN ('online', 'standby', 'offline', 'maintenance')),
    last_ping_at TIMESTAMPTZ DEFAULT NOW(),
    installed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.iot_telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES public.iot_device_fleet(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'fill_reading', 'scale_ticket', 'battery_warning', 'tamper_alert'
    reading_value NUMERIC(10, 2),
    reading_unit VARCHAR(20),
    payload JSONB DEFAULT '{}'::jsonb,
    is_valid BOOLEAN DEFAULT TRUE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LIVE VEHICLE FLEET & GPS TRACKING
CREATE TABLE IF NOT EXISTS public.vehicle_fleet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. 'TN-38-G-4491'
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Electric Tipper', 'Hydraulic Compactor', 'E-Rickshaw Cart', 'Bulk Carrier')),
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    assigned_collector_id UUID REFERENCES public.profiles(id),
    capacity_kg NUMERIC(10, 2) NOT NULL DEFAULT 1500.0,
    current_payload_kg NUMERIC(10, 2) DEFAULT 0.0,
    fuel_type VARCHAR(30) DEFAULT 'Electric (EV)' CHECK (fuel_type IN ('Electric (EV)', 'CNG', 'Diesel')),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'on_route', 'maintenance', 'off_duty')),
    last_service_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicle_live_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicle_fleet(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    speed_kmh NUMERIC(5, 2) DEFAULT 0,
    battery_or_fuel_percent INTEGER DEFAULT 95,
    active_route_id UUID REFERENCES public.collection_routes(id) ON DELETE SET NULL,
    shift_active BOOLEAN DEFAULT TRUE,
    last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GOVERNMENT & MUNICIPAL INTEGRATION REGISTRY
CREATE TABLE IF NOT EXISTS public.government_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(255) NOT NULL, -- e.g. 'Coimbatore Municipal Corporation (CCMC)', 'GCC', 'TNPCB'
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('Municipal_Corporation', 'Municipality', 'Town_Panchayat', 'State_Pollution_Board', 'Central_CPCB')),
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    integration_type VARCHAR(50) DEFAULT 'REST_API' CHECK (integration_type IN ('REST_API', 'CSV_BATCH', 'WEBHOOK_STREAM', 'MANUAL_IMPORT')),
    endpoint_url VARCHAR(255),
    api_version VARCHAR(30) DEFAULT 'v1.4',
    status VARCHAR(30) DEFAULT 'pilot_sandbox' CHECK (status IN ('active', 'pilot_sandbox', 'paused', 'error')),
    sync_frequency_hours INTEGER DEFAULT 6,
    records_exchanged_count INTEGER DEFAULT 0,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.government_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.government_integrations(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    records_count INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'retrying')),
    payload_summary JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AUTHORIZED RECYCLER MARKETPLACE & HANDOVERS
CREATE TABLE IF NOT EXISTS public.recycler_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    cpcb_authorization_id VARCHAR(100) UNIQUE NOT NULL,
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    facility_address TEXT NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    accepted_waste_types JSONB NOT NULL DEFAULT '["Plastic", "Paper"]'::jsonb,
    daily_capacity_tons NUMERIC(8, 2) NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'verified_approved' CHECK (verification_status IN ('pending_verification', 'verified_approved', 'rejected', 'suspended')),
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waste_handover_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handover_code VARCHAR(50) UNIQUE NOT NULL,
    collection_point_id UUID REFERENCES public.collection_points(id),
    recycler_id UUID REFERENCES public.recycler_partners(id),
    waste_category VARCHAR(50) NOT NULL,
    weight_kg NUMERIC(10, 2) NOT NULL,
    certificate_hash VARCHAR(255) NOT NULL,
    collector_id UUID REFERENCES public.profiles(id),
    handover_status VARCHAR(30) DEFAULT 'received_verified' CHECK (handover_status IN ('scheduled', 'in_transit', 'received_verified', 'disputed')),
    weighbridge_slip_url TEXT,
    handover_date TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REAL GREEN MONEY PAYOUT INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.payout_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    redemption_id UUID REFERENCES public.redemption_requests(id) ON DELETE SET NULL,
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_rupees NUMERIC(10, 2) NOT NULL,
    points_redeemed INTEGER NOT NULL,
    upi_id VARCHAR(100) NOT NULL,
    payout_provider VARCHAR(50) DEFAULT 'Razorpay_Sandbox' CHECK (payout_provider IN ('Razorpay_Sandbox', 'Cashfree_Sandbox', 'Simulated_Pilot', 'Bank_NEFT')),
    provider_payout_id VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    payout_status VARCHAR(30) DEFAULT 'success' CHECK (payout_status IN ('queued', 'processing', 'success', 'failed', 'reversed')),
    failure_reason TEXT,
    reconciled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMUNITY & ENVIRONMENTAL AWARENESS NETWORK
CREATE TABLE IF NOT EXISTS public.community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_title VARCHAR(255) NOT NULL,
    organizer_type VARCHAR(50) NOT NULL CHECK (organizer_type IN ('NGO', 'College_Eco_Club', 'Municipality', 'Community_Lead')),
    organizer_name VARCHAR(255) NOT NULL,
    district_code VARCHAR(20) REFERENCES public.district_metadata(district_code),
    event_date DATE NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    target_volunteers INTEGER DEFAULT 50,
    registered_volunteers_count INTEGER DEFAULT 0,
    waste_stream_focus VARCHAR(50) DEFAULT 'Plastic & Paper',
    status VARCHAR(30) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active_today', 'completed', 'cancelled')),
    hours_credit NUMERIC(4, 1) DEFAULT 4.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    hours_completed NUMERIC(4, 1) DEFAULT 0,
    certificate_issued BOOLEAN DEFAULT FALSE,
    UNIQUE(event_id, citizen_id)
);

-- 7. ADVANCED SECURITY & COMPLIANCE AUDIT
CREATE TABLE IF NOT EXISTS public.security_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'login_success', 'suspicious_burst', 'rate_limit_trip', 'role_access_revoked'
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TAMIL NADU 38-DISTRICT ROLLOUT PIPELINE
CREATE TABLE IF NOT EXISTS public.district_rollout_status (
    district_code VARCHAR(20) PRIMARY KEY REFERENCES public.district_metadata(district_code) ON DELETE CASCADE,
    rollout_stage VARCHAR(50) NOT NULL CHECK (rollout_stage IN ('Stage 1: Live Pilot', 'Stage 2: Early Expansion', 'Stage 3: Regional Cluster', 'Stage 4: Onboarding', 'Stage 5: Standby')),
    onboarding_score INTEGER DEFAULT 0 CHECK (onboarding_score >= 0 AND onboarding_score <= 100),
    is_operational BOOLEAN DEFAULT FALSE,
    admin_assigned BOOLEAN DEFAULT FALSE,
    hubs_deployed INTEGER DEFAULT 0,
    collectors_active INTEGER DEFAULT 0,
    recyclers_partnered INTEGER DEFAULT 0,
    data_completeness_pct INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.iot_device_fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycler_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_handover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_rollout_status ENABLE ROW LEVEL SECURITY;

-- Public Read for Community Events, Recycler Directory & Rollout Status
DROP POLICY IF EXISTS "Public Read Community Events" ON public.community_events;
CREATE POLICY "Public Read Community Events" ON public.community_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read Recycler Directory" ON public.recycler_partners;
CREATE POLICY "Public Read Recycler Directory" ON public.recycler_partners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read District Rollout" ON public.district_rollout_status;
CREATE POLICY "Public Read District Rollout" ON public.district_rollout_status FOR SELECT USING (true);

-- Authenticated Volunteers
DROP POLICY IF EXISTS "Citizens Manage Own Registrations" ON public.event_volunteers;
CREATE POLICY "Citizens Manage Own Registrations" ON public.event_volunteers FOR ALL USING (
    citizen_id = auth.uid()
);

-- Restricted Admin Access for Security, Payouts, Fleet and IoT
DROP POLICY IF EXISTS "Admin Full Access IoT Fleet" ON public.iot_device_fleet;
CREATE POLICY "Admin Full Access IoT Fleet" ON public.iot_device_fleet FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'state_admin'))
);

DROP POLICY IF EXISTS "Admin Full Access Vehicles" ON public.vehicle_fleet;
CREATE POLICY "Admin Full Access Vehicles" ON public.vehicle_fleet FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('collector', 'admin', 'state_admin'))
);

DROP POLICY IF EXISTS "Admin Full Access Payouts" ON public.payout_transactions;
CREATE POLICY "Admin Full Access Payouts" ON public.payout_transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'state_admin'))
);
