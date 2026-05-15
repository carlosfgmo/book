-- ============================================================
-- migration_v6_liquidaciones.sql
-- Adds writer payment tracking to the payment table.
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.payment
  ADD COLUMN IF NOT EXISTS writer_paid    boolean   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS writer_paid_at timestamptz;

-- Index for fast lookup of pending writer payments
CREATE INDEX IF NOT EXISTS idx_payment_writer_paid
  ON public.payment(writer_paid) WHERE status = 'verified';
