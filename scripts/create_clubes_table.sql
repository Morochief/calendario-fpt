-- Create the enum for club status
DO $$ BEGIN
    CREATE TYPE club_estado AS ENUM ('afiliado', 'pendiente', 'inactivo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the clubes table
CREATE TABLE IF NOT EXISTS public.clubes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    siglas TEXT NOT NULL,
    estado club_estado DEFAULT 'pendiente',
    color TEXT DEFAULT '#1E3A8A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clubes ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
    CREATE POLICY "Public clubs are viewable by everyone" ON public.clubes FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can insert clubs" ON public.clubes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can update clubs" ON public.clubes FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can delete clubs" ON public.clubes FOR DELETE USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant access to public (implicit via policies but good practice)
GRANT SELECT ON public.clubes TO anon, authenticated;
GRANT ALL ON public.clubes TO authenticated;
