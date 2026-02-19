-- Fix Unindexed Foreign Keys and Unused Indexes (2026)
-- Based on Supabase Linter Recommendations

-- 1. Add indexes for 'eventos' foreign keys
CREATE INDEX IF NOT EXISTS idx_eventos_modalidad_id ON public.eventos(modalidad_id);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo_evento_id ON public.eventos(tipo_evento_id);

-- 2. Add indexes for 'inscripciones' foreign keys
CREATE INDEX IF NOT EXISTS idx_inscripciones_evento_id ON public.inscripciones(evento_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_modalidad_id ON public.inscripciones(modalidad_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_tipo_evento_id ON public.inscripciones(tipo_evento_id);

-- 3. Drop unused index on 'eventos'
-- This index was flagged as unused by the database linter.
DROP INDEX IF EXISTS idx_eventos_club_id;
