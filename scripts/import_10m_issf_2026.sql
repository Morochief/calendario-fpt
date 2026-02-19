-- Import 2026 Calendar for '10M ISSF'
-- Location: Comité Olímpico Paraguayo (COP)
-- Organizing Club: Federación Paraguaya de Tiro (FPDT)
-- Run this script in the Supabase SQL Editor

DO $$
DECLARE
    v_modalidad_id uuid;
    v_tipo_evento_id uuid;
    v_club_id uuid;
    v_ubicacion text := 'POLÍGONO DE TIRO 10M. Comité Olímpico Paraguayo';
    v_ubicacion_url text := 'https://maps.app.goo.gl/aWjf3ojtBuxo2ouY8';
    v_hora time := '08:30';
BEGIN
    -- 1. Ensure Modalidad exists
    INSERT INTO modalidades (nombre, color)
    SELECT '10M ISSF', '#4F46E5'
    WHERE NOT EXISTS (SELECT 1 FROM modalidades WHERE nombre = '10M ISSF');

    SELECT id INTO v_modalidad_id FROM modalidades WHERE nombre = '10M ISSF' LIMIT 1;
    
    -- 2. Ensure Club exists
    INSERT INTO clubes (nombre, siglas, estado, color)
    SELECT 'Federación Paraguaya de Tiro', 'FPDT', 'afiliado', '#1E3A8A'
    WHERE NOT EXISTS (SELECT 1 FROM clubes WHERE siglas = 'FPDT');

    SELECT id INTO v_club_id FROM clubes WHERE siglas = 'FPDT' LIMIT 1;

    -- 3. Get Tipo Evento ID (Default to 'Puntuable')
    SELECT id INTO v_tipo_evento_id FROM tipos_evento WHERE nombre = 'Puntuable' LIMIT 1;
    IF v_tipo_evento_id IS NULL THEN
         SELECT id INTO v_tipo_evento_id FROM tipos_evento LIMIT 1;
    END IF;

    -- 4. Insert 10 Events
    
    -- 1a Fecha: 28/02/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '1a Fecha - 10M ISSF', '2026-02-28', v_hora, v_ubicacion, v_ubicacion_url);

    -- 2a Fecha: 21/03/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '2a Fecha - 10M ISSF', '2026-03-21', v_hora, v_ubicacion, v_ubicacion_url);

    -- 3a Fecha: 18/04/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '3a Fecha - 10M ISSF', '2026-04-18', v_hora, v_ubicacion, v_ubicacion_url);

    -- 4a Fecha: 23/05/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '4a Fecha - 10M ISSF', '2026-05-23', v_hora, v_ubicacion, v_ubicacion_url);

    -- 5a Fecha: 20/06/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '5a Fecha - 10M ISSF', '2026-06-20', v_hora, v_ubicacion, v_ubicacion_url);

    -- 6a Fecha: 18/07/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '6a Fecha - 10M ISSF', '2026-07-18', v_hora, v_ubicacion, v_ubicacion_url);

    -- 7a Fecha: 22/08/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '7a Fecha - 10M ISSF', '2026-08-22', v_hora, v_ubicacion, v_ubicacion_url);

    -- 8a Fecha: 19/09/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '8a Fecha - 10M ISSF', '2026-09-19', v_hora, v_ubicacion, v_ubicacion_url);

    -- 9a Fecha: 24/10/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '9a Fecha - 10M ISSF', '2026-10-24', v_hora, v_ubicacion, v_ubicacion_url);

    -- 10a Fecha: 21/11/26
    INSERT INTO eventos (modalidad_id, tipo_evento_id, club_id, titulo, fecha, hora, ubicacion, ubicacion_url)
    VALUES (v_modalidad_id, v_tipo_evento_id, v_club_id, '10a Fecha - 10M ISSF', '2026-11-21', v_hora, v_ubicacion, v_ubicacion_url);

    RAISE NOTICE 'Successfully imported 10 events for 10M ISSF 2026!';
END $$;
