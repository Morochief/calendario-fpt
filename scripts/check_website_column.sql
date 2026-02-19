
-- Check if the column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'clubes' AND column_name = 'website_url';

-- Check if any club has a website_url
SELECT nombre, website_url 
FROM clubes 
WHERE website_url IS NOT NULL;
