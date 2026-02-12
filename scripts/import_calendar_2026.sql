-- Import 2026 Calendar for 'Aire Comprimido (Olímpico)'
-- Run this script in the Supabase SQL Editor

DO $$
DECLARE
    v_modalidad_id uuid;
    v_tipo_evento_id uuid;
    v_ubicacion text := 'Comando de Ingeniería del Ejército (24 Ptdas y 14 de Mayo - Tacumbú)';
    v_ubicacion_url text := 'https://maps.app.goo.gl/ScXyL13q2A1Cc1Se9?g_st=iw';
    v_descripcion text := 'Coordinación: Gral Máximo Díaz (0982 234 475) y Dr. Wilmar Cabral (0992 471 440).';
    v_hora time := '09:00';
BEGIN
    -- 1. Find Modalidad ID
    SELECT id INTO v_modalidad_id FROM modalidades WHERE nombre = 'Aire Comprimido (Olímpico)' LIMIT 1;
    
    IF v_modalidad_id IS NULL THEN
        RAISE EXCEPTION 'Modalidad "Aire Comprimido (Olímpico)" not found';
    END IF;

    -- 2. Find Tipo Evento ID (Default to 'Puntuable')
    SELECT id INTO v_tipo_evento_id FROM tipos_evento WHERE nombre = 'Puntuable' LIMIT 1;
    
    -- If 'Puntuable' not found, try any type or null (optional, depending on strictness)
    IF v_tipo_evento_id IS NULL THEN
         SELECT id INTO v_tipo_evento_id FROM tipos_evento LIMIT 1;
    END IF;

    -- 3. Insert Events
    
    -- 1a Fecha: 07/03/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_modalidad_id, v_tipo_evento_id, '1a Fecha - Aire Comprimido', '2026-03-07', v_hora, v_ubicacion, v_ubicacion_url, v_descripcion);

    -- 2a Fecha: 09/05/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_modalidad_id, v_tipo_evento_id, '2a Fecha - Aire Comprimido', '2026-05-09', v_hora, v_ubicacion, v_ubicacion_url, v_descripcion);

    -- 3a Fecha: 04/07/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_modalidad_id, v_tipo_evento_id, '3a Fecha - Aire Comprimido', '2026-07-04', v_hora, v_ubicacion, v_ubicacion_url, v_descripcion);

    -- 4a Fecha: 05/09/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_modalidad_id, v_tipo_evento_id, '4a Fecha - Aire Comprimido', '2026-09-05', v_hora, v_ubicacion, v_ubicacion_url, v_descripcion);

    -- 5a Fecha: 31/10/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_modalidad_id, v_tipo_evento_id, '5a Fecha - Aire Comprimido', '2026-10-31', v_hora, v_ubicacion, v_ubicacion_url, v_descripcion);

END $$;
