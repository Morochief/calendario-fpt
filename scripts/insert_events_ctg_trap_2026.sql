
DO $$
DECLARE
    v_club_id uuid;
    v_modalidad_id uuid;
    v_tipo_evento_id uuid;
BEGIN
    -- 1. Get Club ID (Club de Tiro Guarani or CTG)
    SELECT id INTO v_club_id FROM clubes WHERE nombre ILIKE '%Guarani%' OR nombre ILIKE '%CTG%' LIMIT 1;
    
    -- 2. Get Modality ID (Trap Americano)
    SELECT id INTO v_modalidad_id FROM modalidades WHERE nombre ILIKE '%Trap Americano%' LIMIT 1;

    -- 3. Get Event Type ID (Puntuable)
    SELECT id INTO v_tipo_evento_id FROM tipos_evento WHERE nombre ILIKE '%Puntuable%' LIMIT 1;

    -- 4. Verify IDs found
    IF v_club_id IS NULL THEN
        RAISE EXCEPTION 'Club "Club de Tiro Guarani" or "CTG" not found';
    END IF;
    IF v_modalidad_id IS NULL THEN
        RAISE EXCEPTION 'Modalidad "Trap Americano" not found';
    END IF;
    IF v_tipo_evento_id IS NULL THEN
        RAISE EXCEPTION 'Tipo Evento "Puntuable" not found';
    END IF;

    -- 5. Insert Events
    -- 09/05/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        '1a Fecha - Trap Americano - CTG',
        '2026-05-09',
        '09:00',
        'Club de Tiro Guarani',
        'https://maps.app.goo.gl/U98T8JeVhEyzgjL19',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    -- 17/10/26
    INSERT INTO eventos (titulo, fecha, hora, ubicacion, ubicacion_url, club_id, modalidad_id, tipo_evento_id)
    VALUES (
        '2a Fecha - Trap Americano - CTG',
        '2026-10-17',
        '09:00',
        'Club de Tiro Guarani',
        'https://maps.app.goo.gl/U98T8JeVhEyzgjL19',
        v_club_id,
        v_modalidad_id,
        v_tipo_evento_id
    );

    RAISE NOTICE 'Eventos de Trap Americano (CTG) insertados correctamente.';
END $$;
