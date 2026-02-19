-- Agregar columna logo_url a la tabla clubes si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 
                   FROM information_schema.columns 
                   WHERE table_name='clubes' AND column_name='logo_url') THEN
        ALTER TABLE clubes ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- Asegurar permisos
GRANT ALL ON TABLE clubes TO authenticated;
GRANT SELECT ON TABLE clubes TO anon;

-- Instrucciones para Storage (Para ejecutar en el SQL Editor de Supabase si no se hace graficamente):
-- Crear el bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club_logos', 'club_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Politica para que cualquiera pueda ver los logos
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'club_logos' );

-- Politica para que administradores autenticados puedan subir
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK ( bucket_id = 'club_logos' );

-- Politica para que administradores autenticados puedan actualizar
CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
TO authenticated
USING ( bucket_id = 'club_logos' );

-- Politica para que administradores autenticados puedan eliminar
CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
TO authenticated
USING ( bucket_id = 'club_logos' );
