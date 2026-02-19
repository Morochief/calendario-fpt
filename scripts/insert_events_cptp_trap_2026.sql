
DO $$
DECLARE
    v_club_id uuid;
    v_modalidad_id uuid;
    v_tipo_evento_id uuid;
BEGIN
    -- 1. Get Club ID (CPTP)
    SELECT id INTO v_club_id FROM clubes WHERE siglas ILIKE '%CPTP%' OR nombre ILIKE '%Paraguayo de Tiro Práctico%' LIMIT 1;
    
    -- 2. Get Modality ID (Trap Americano)
    SELECT id INTO v_modalidad_id FROM modalidades WHERE nombre ILIKE '%Trap Americano%' LIMIT 1;

    -- 3. Get Event Type ID (Puntuable)
    SELECT id INTO v_tipo_evento_id FROM tipos_evento WHERE nombre ILIKE '%Puntuable%' LIMIT 1;

    -- 4. Verify IDs found
    IF v_club_id IS NULL THEN
        RAISE EXCEPTION 'Club "CPTP" not found';
    END IF;
    IF v_modalidad_id IS NULL THEN
        RAISE EXCEPTION 'Modalidad "Trap Americano" not found';
    END IF;
    IF v_tipo_evento_id IS NULL THEN
        RAISE EXCEPTION 'Tipo Evento "Puntuable" not found';
    END IF;

    -- 5. Insert Events
    -- 18/07/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        'Trap Americano - CPTP',
        '2026-07-18',
        '09:00',
        'Club Paraguayo de Tiro Práctico',
        'https://maps.app.goo.gl/xdXA2AoLoiFW5RAA6',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    -- 14/11/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        'Trap Americano - CPTP',
        '2026-11-14',
        '09:00',
        'Club Paraguayo de Tiro Práctico',
        'https://maps.app.goo.gl/xdXA2AoLoiFW5RAA6',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    RAISE NOTICE 'Eventos de Trap Americano (CPTP) insertados correctamente.';
END $$;
