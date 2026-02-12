-- OPTIMIZE RLS POLICIES
-- This script fixes "auth_rls_initplan" and "multiple_permissive_policies" warnings.

-- ============================================================
-- 1. Eventos
-- ============================================================
DROP POLICY IF EXISTS "Admin gestiona eventos" ON public.eventos;
DROP POLICY IF EXISTS "Público ve eventos" ON public.eventos;
DROP POLICY IF EXISTS "Public select events" ON public.eventos;
DROP POLICY IF EXISTS "Admin all events" ON public.eventos;

-- Optimized: Public Read (Everyone, including admins, reads via this)
CREATE POLICY "Public read events"
ON public.eventos FOR SELECT
USING (true);

-- Optimized: Admin Write (Only Authenticated can Insert/Update/Delete)
CREATE POLICY "Admin write events"
ON public.eventos FOR ALL
USING ( (select auth.role()) = 'authenticated' )
WITH CHECK ( (select auth.role()) = 'authenticated' );

-- Note: We split "ALL" minus SELECT effectively by having a permissive SELECT above. 
-- However, "FOR ALL" includes SELECT. To avoid "Multiple Permissive Policies" on SELECT,
-- we should strictly define the Admin policy for MODIFICATION only, OR rely on the fact that
-- 'authenticated' is a subset of 'public' and just use one policy for SELECT.
-- Best practice to avoid the warning:
DROP POLICY "Admin write events" ON public.eventos; -- Drop the one I just defined to refine it

CREATE POLICY "Admin insert events"
ON public.eventos FOR INSERT
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin update events"
ON public.eventos FOR UPDATE
USING ( (select auth.role()) = 'authenticated' )
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin delete events"
ON public.eventos FOR DELETE
USING ( (select auth.role()) = 'authenticated' );


-- ============================================================
-- 2. Inscripciones
-- ============================================================
DROP POLICY IF EXISTS "Admin gestiona inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Público crea inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Público ve inscripciones" ON public.inscripciones;

-- Public Read (Everyone triggers this)
CREATE POLICY "Public read inscripciones"
ON public.inscripciones FOR SELECT
USING (true);

-- Public Create (Anyone can register, but must provide at least a name)
CREATE POLICY "Public create inscripciones"
ON public.inscripciones FOR INSERT
WITH CHECK ( char_length(nombre) > 0 );

-- Admin Update/Delete (Only authenticated)
CREATE POLICY "Admin modify inscripciones"
ON public.inscripciones FOR UPDATE
USING ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin delete inscripciones"
ON public.inscripciones FOR DELETE
USING ( (select auth.role()) = 'authenticated' );


-- ============================================================
-- 3. Modalidades
-- ============================================================
DROP POLICY IF EXISTS "Admin gestiona modalidades" ON public.modalidades;
DROP POLICY IF EXISTS "Público ve modalidades" ON public.modalidades;

CREATE POLICY "Public read modalidades"
ON public.modalidades FOR SELECT
USING (true);

CREATE POLICY "Admin insert modalidades"
ON public.modalidades FOR INSERT
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin update modalidades"
ON public.modalidades FOR UPDATE
USING ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin delete modalidades"
ON public.modalidades FOR DELETE
USING ( (select auth.role()) = 'authenticated' );


-- ============================================================
-- 4. Tipos Evento
-- ============================================================
DROP POLICY IF EXISTS "Admin gestiona tipos_evento" ON public.tipos_evento;
DROP POLICY IF EXISTS "Público ve tipos_evento" ON public.tipos_evento;

CREATE POLICY "Public read tipos_evento"
ON public.tipos_evento FOR SELECT
USING (true);

CREATE POLICY "Admin insert tipos_evento"
ON public.tipos_evento FOR INSERT
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin update tipos_evento"
ON public.tipos_evento FOR UPDATE
USING ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin delete tipos_evento"
ON public.tipos_evento FOR DELETE
USING ( (select auth.role()) = 'authenticated' );


-- ============================================================
-- 5. Reglamentos
-- ============================================================
DROP POLICY IF EXISTS "Admin inserta reglamentos" ON public.reglamentos;
DROP POLICY IF EXISTS "Admin elimina reglamentos" ON public.reglamentos;
DROP POLICY IF EXISTS "Admin actualiza reglamentos" ON public.reglamentos;
DROP POLICY IF EXISTS "Reglamentos públicos" ON public.reglamentos;
DROP POLICY IF EXISTS "Admin gestiona reglamentos" ON public.reglamentos;
DROP POLICY IF EXISTS "Público ve reglamentos" ON public.reglamentos;

CREATE POLICY "Public read reglamentos"
ON public.reglamentos FOR SELECT
USING (true);

CREATE POLICY "Admin insert reglamentos"
ON public.reglamentos FOR INSERT
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin update reglamentos"
ON public.reglamentos FOR UPDATE
USING ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Admin delete reglamentos"
ON public.reglamentos FOR DELETE
USING ( (select auth.role()) = 'authenticated' );
