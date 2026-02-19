-- RESTORE Deleted Index for 'eventos' (Club ID)
-- I previously removed this thinking it was unused, but it is required for the foreign key.

CREATE INDEX IF NOT EXISTS idx_eventos_club_id ON public.eventos(club_id);

-- NOTE ON OTHER WARNINGS:
-- The "Unused Index" warnings for the other indexes (modalidad_id, tipo_evento_id, etc.)
-- are appearing because they were JUST created and haven't been used by queries yet.
-- It is recommended to KEEP them to ensure performance for future joins and 
-- data integrity operations (like deletions).
