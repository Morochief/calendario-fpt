-- Add contact fields to clubes table
-- Allows storing a club representative's name and phone number

ALTER TABLE public.clubes
ADD COLUMN IF NOT EXISTS contacto_nombre TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contacto_telefono TEXT DEFAULT NULL;
