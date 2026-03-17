-- 1. Asegurar que el bucket 'event-images' exista y sea público
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Permitir acceso de lectura pública a las imágenes de la galería
CREATE POLICY "Acceso público lectura galería"
ON storage.objects FOR SELECT
USING ( bucket_id = 'event-images' );

-- 3. Política: Permitir a usuarios autenticados subir imágenes (Insert)
CREATE POLICY "Admin sube imágenes galería"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- 4. Política: Permitir a usuarios autenticados borrar imágenes (Delete)
CREATE POLICY "Admin borra imágenes galería"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- 5. Política: Permitir a usuarios autenticados actualizar imágenes (Update)
CREATE POLICY "Admin actualiza imágenes galería"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);
