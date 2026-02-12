-- Create Categorias Table
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Categorias
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categorias"
ON public.categorias FOR SELECT
USING (true);

CREATE POLICY "Admin insert categorias"
ON public.categorias FOR INSERT
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin update categorias"
ON public.categorias FOR UPDATE
USING ( (select auth.role()) = 'authenticated' )
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin delete categorias"
ON public.categorias FOR DELETE
USING ( (select auth.role()) = 'authenticated' );
