-- Update Club Status Enum (2026)
-- Renaming 'afiliado' to 'afederado' to match new requirements.
-- This script updates existing data.

UPDATE public.clubes
SET estado = 'afederado'
WHERE estado = 'afiliado';

-- NOTE: If there is a Check Constraint on the 'estado' column,
-- it might need to be dropped or updated manually in the Supabase Dashboard.
-- This script assumes it's a TEXT column or that the constraint permits the update.
