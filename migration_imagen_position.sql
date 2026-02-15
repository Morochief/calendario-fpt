-- Add imagen_position column to eventos table
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS imagen_position TEXT DEFAULT 'center';

COMMENT ON COLUMN eventos.imagen_position IS 'Posición de la imagen (center, top, bottom, etc) para CSS background-position';
