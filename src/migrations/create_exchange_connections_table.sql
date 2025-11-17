-- Migration: Create exchange_connections table
-- Date: 2025-10-22
-- Description: Table to store user exchange API connections

-- Create the table in the public schema
CREATE TABLE IF NOT EXISTS public.exchange_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exchange_name VARCHAR(50) NOT NULL,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_exchange UNIQUE(user_id, exchange_name)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_exchange_connections_user_id ON public.exchange_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_connections_user_active ON public.exchange_connections(user_id, is_active);

-- Enable RLS
ALTER TABLE public.exchange_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own exchange connections" ON public.exchange_connections;
DROP POLICY IF EXISTS "Users can insert own exchange connections" ON public.exchange_connections;
DROP POLICY IF EXISTS "Users can update own exchange connections" ON public.exchange_connections;
DROP POLICY IF EXISTS "Users can delete own exchange connections" ON public.exchange_connections;

-- Create RLS policies
CREATE POLICY "Users can view own exchange connections"
  ON public.exchange_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exchange connections"
  ON public.exchange_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exchange connections"
  ON public.exchange_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exchange connections"
  ON public.exchange_connections
  FOR DELETE
  USING (auth.uid() = user_id);
