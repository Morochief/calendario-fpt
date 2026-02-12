-- Enable RLS on storage.objects (just in case, though usually enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Create the 'eventos' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('eventos', 'eventos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Allow Public Read Access
CREATE POLICY "Public Access to Eventos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'eventos' );

-- 3. Policy: Allow Authenticated Insert
CREATE POLICY "Auth Insert Eventos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'eventos' 
  AND auth.role() = 'authenticated'
);

-- 4. Policy: Allow Authenticated Update
CREATE POLICY "Auth Update Eventos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'eventos' 
  AND auth.role() = 'authenticated'
);

-- 5. Policy: Allow Authenticated Delete
CREATE POLICY "Auth Delete Eventos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'eventos' 
  AND auth.role() = 'authenticated'
);
