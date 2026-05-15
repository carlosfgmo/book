-- ============================================================
-- migration_v7_back_cover.sql
-- Adds back_cover_url column to the book table.
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.book
  ADD COLUMN IF NOT EXISTS back_cover_url text;
