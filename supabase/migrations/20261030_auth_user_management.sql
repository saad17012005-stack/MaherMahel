-- ==============================================================================
-- MEHER MAHEL LUXURY BOUTIQUE — AUTHENTICATION, DATABASE & USER MANAGEMENT
-- Supabase / PostgreSQL Schema & Row Level Security (RLS) Policies
-- Migration: 20261030_auth_user_management.sql
-- ==============================================================================

-- 1. PROFILES TABLE (Extends Supabase auth.users or standalone auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email and role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. USER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- 3. USER WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.user_wishlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_wishlist UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wishlists_user_id ON public.user_wishlists(user_id);

-- 4. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- 5. UPDATE EXISTING COMMERCE TABLES WITH USER OWNERSHIP
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.custom_abaya_orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_user_id ON public.custom_abaya_orders(user_id);

-- 6. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER tr_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. AUTOMATIC PROFILE CREATION TRIGGER ON SUPABASE AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    'customer',
    COALESCE((NEW.email_confirmed_at IS NOT NULL), FALSE)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all customer-sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_suspended = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Customers can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Customers can update permitted fields of their own profile (name, phone, avatar)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Prevents self-promotion
    AND is_suspended = (SELECT is_suspended FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can update all profile fields
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- USER ADDRESSES POLICIES
-- ------------------------------------------------------------------------------
-- Users can view only their own saved addresses
CREATE POLICY "Users can view own addresses"
  ON public.user_addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Users can insert addresses for themselves
CREATE POLICY "Users can create own addresses"
  ON public.user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own addresses
CREATE POLICY "Users can update own addresses"
  ON public.user_addresses FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- Users can delete only their own addresses
CREATE POLICY "Users can delete own addresses"
  ON public.user_addresses FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- USER WISHLISTS POLICIES
-- ------------------------------------------------------------------------------
-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist"
  ON public.user_wishlists FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add products to their own wishlist
CREATE POLICY "Users can add to own wishlist"
  ON public.user_wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own wishlist
CREATE POLICY "Users can remove from own wishlist"
  ON public.user_wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- ADMIN AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------
-- Only verified administrators can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin());

-- Only server-side functions / admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.is_admin());
