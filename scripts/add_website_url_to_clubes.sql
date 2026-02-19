
-- 1. Add website_url column to clubes table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clubes' AND column_name = 'website_url') THEN
        ALTER TABLE clubes ADD COLUMN website_url TEXT;
    END IF;
END $$;

-- 2. Update CPTP with the provided URL
UPDATE clubes
SET website_url = 'https://calendario-cptp.vercel.app/'
WHERE siglas ILIKE '%CPTP%' OR nombre ILIKE '%Paraguayo de Tiro Práctico%';

-- 3. Verify
SELECT nombre, website_url FROM clubes WHERE website_url IS NOT NULL;
