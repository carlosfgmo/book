-- ============================================================
-- migration_v8_book_summary.sql
-- Adds a detailed "summary" text column to the book table.
-- Uses a lightweight markdown-like syntax parsed by src/lib/bookSummary.ts
-- and rendered by src/components/catalogo/BookSummarySection.tsx.
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.book
  ADD COLUMN IF NOT EXISTS summary text;