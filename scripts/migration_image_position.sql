-- Add 'imagen_position' column to 'eventos' table
-- Default value is 'center' to maintain current behavior for existing events

ALTER TABLE eventos 
ADD COLUMN imagen_position text DEFAULT 'center';

-- Optional: Add a check constraint to ensure only valid values are used
-- ALTER TABLE eventos ADD CONSTRAINT check_imagen_position CHECK (imagen_position IN ('center', 'top', 'bottom', 'left', 'right'));
