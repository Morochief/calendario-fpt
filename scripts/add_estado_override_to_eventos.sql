-- Migration: Add estado_override to eventos table
-- This allows admins to manually override the dynamic status (activo/finalizado) 
-- with explicitly set statuses like 'suspendido', 'cancelado', etc.

ALTER TABLE public.eventos
ADD COLUMN IF NOT EXISTS estado_override varchar(50) NULL;

-- Make sure the column is accessible by the anon and authenticated roles
GRANT SELECT(estado_override) ON public.eventos TO anon;
GRANT SELECT(estado_override), INSERT(estado_override), UPDATE(estado_override) ON public.eventos TO authenticated;
