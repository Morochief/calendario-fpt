-- Add club_id column to eventos table
-- This links each event to the organizing club (optional)

ALTER TABLE public.eventos
ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES public.clubes(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_eventos_club_id ON public.eventos(club_id);
