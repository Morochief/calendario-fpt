-- FIX: Update Club Status Enum (2026)
-- Corrects the previous error by altering the ENUM type directly.

-- 1. Rename 'afiliado' to 'afederado' in the ENUM definition.
-- This automatically updates all rows using this value.
ALTER TYPE club_estado RENAME VALUE 'afiliado' TO 'afederado';

-- 2. Add the new 'no_afederado' value to the ENUM.
ALTER TYPE club_estado ADD VALUE IF NOT EXISTS 'no_afederado';

-- verify:
-- SELECT enumlevel, enumlabel FROM pg_enum WHERE enumtypid = 'club_estado'::regtype;
