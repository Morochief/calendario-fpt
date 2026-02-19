
DO $$
DECLARE
    v_club_id uuid;
    v_modalidad_id uuid;
    v_tipo_evento_id uuid;
BEGIN
    -- 1. Get Club ID (Club Internacional de Tenis)
    SELECT id INTO v_club_id FROM clubes WHERE nombre ILIKE '%Internacional de Tenis%' LIMIT 1;
    
    -- 2. Get Modality ID (Armas Largas)
    -- Intenta encontrar 'Armas Largas' específicamente, si no, busca 'Cartel' como fallback (aunque el título lo distinguirá)
    SELECT id INTO v_modalidad_id FROM modalidades WHERE nombre ILIKE '%Armas Largas%' LIMIT 1;

    -- 3. Get Event Type ID (Puntuable)
    SELECT id INTO v_tipo_evento_id FROM tipos_evento WHERE nombre ILIKE '%Puntuable%' LIMIT 1;

    -- 4. Verify IDs found
    IF v_club_id IS NULL THEN
        RAISE EXCEPTION 'Club "Club Internacional de Tenis" not found';
    END IF;
    IF v_modalidad_id IS NULL THEN
        -- Fallback: Si no existe "Armas Largas", usa "Cartel" y asumimos que el título diferencia
        SELECT id INTO v_modalidad_id FROM modalidades WHERE nombre ILIKE '%Cartel%' LIMIT 1;
        IF v_modalidad_id IS NULL THEN
             RAISE EXCEPTION 'Modalidad "Armas Largas" o "Cartel" not found';
        END IF;
        RAISE NOTICE 'Modalidad "Armas Largas" no encontrada, usando "Cartel" como fallback.';
    END IF;
    IF v_tipo_evento_id IS NULL THEN
        RAISE EXCEPTION 'Tipo Evento "Puntuable" not found';
    END IF;

    -- 5. Insert Events
    -- Sábado: 07/03/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        '1a Fecha - Cartel: Armas Largas - C.I.T.',
        '2026-03-07',
        '09:00',
        'Comando de Ingeniería del Ejército',
        'https://maps.app.goo.gl/ScXyL13q2A1Cc1Se9?g_st=iw',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    -- Sábado: 09/05/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        '2a Fecha - Cartel: Armas Largas - C.I.T.',
        '2026-05-09',
        '09:00',
        'Comando de Ingeniería del Ejército',
        'https://maps.app.goo.gl/ScXyL13q2A1Cc1Se9?g_st=iw',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    -- Sábado: 04/07/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        '3a Fecha - Cartel: Armas Largas - C.I.T.',
        '2026-07-04',
        '09:00',
        'Comando de Ingeniería del Ejército',
        'https://maps.app.goo.gl/ScXyL13q2A1Cc1Se9?g_st=iw',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    -- Sábado: 05/09/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        '4a Fecha - Cartel: Armas Largas - C.I.T.',
        '2026-09-05',
        '09:00',
        'Comando de Ingeniería del Ejército',
        'https://maps.app.goo.gl/ScXyL13q2A1Cc1Se9?g_st=iw',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    -- Sábado: 31/10/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        '5a Fecha - Cartel: Armas Largas - C.I.T.',
        '2026-10-31',
        '09:00',
        'Comando de Ingeniería del Ejército',
        'https://maps.app.goo.gl/ScXyL13q2A1Cc1Se9?g_st=iw',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    RAISE NOTICE 'Eventos de Armas Largas insertados correctamente.';
END $$;
