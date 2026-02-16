-- ============================================================
-- Import 2026 Calendar for 'Trap Americano' and 'Hélice'
-- Location: Comando de Ingeniería del Ejército
-- Run this script in the Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
    v_mod_trap uuid;
    v_mod_helice uuid;
    v_tipo_puntuable uuid;
    v_ubicacion text := 'Comando de Ingeniería del Ejército (24 Ptdas y 14 de Mayo - Tacumbú)';
    v_ubicacion_url text := 'https://maps.app.goo.gl/ScXyL13q2A1Cc1Se9?g_st=iw';
    v_hora time := '08:30';
BEGIN

    -- ═══════════════════════════════════════════
    -- 1. Ensure Modalidades exist
    -- ═══════════════════════════════════════════
    INSERT INTO modalidades (nombre, color)
    SELECT 'Trap Americano', '#65A30D'
    WHERE NOT EXISTS (SELECT 1 FROM modalidades WHERE nombre = 'Trap Americano');

    INSERT INTO modalidades (nombre, color)
    SELECT 'Hélice', '#6B7280'
    WHERE NOT EXISTS (SELECT 1 FROM modalidades WHERE nombre = 'Hélice');

    SELECT id INTO v_mod_trap FROM modalidades WHERE nombre = 'Trap Americano' LIMIT 1;
    SELECT id INTO v_mod_helice FROM modalidades WHERE nombre = 'Hélice' LIMIT 1;

    IF v_mod_trap IS NULL THEN
        RAISE EXCEPTION 'Modalidad "Trap Americano" not found';
    END IF;
    IF v_mod_helice IS NULL THEN
        RAISE EXCEPTION 'Modalidad "Hélice" not found';
    END IF;

    -- ═══════════════════════════════════════════
    -- 2. Get Tipo Evento 'Puntuable'
    -- ═══════════════════════════════════════════
    SELECT id INTO v_tipo_puntuable FROM tipos_evento WHERE nombre = 'Puntuable' LIMIT 1;

    -- ═══════════════════════════════════════════
    -- 3. Ensure Clubes exist
    --    CNSB, CTG, CPTP, CTCOF, CC
    -- ═══════════════════════════════════════════
    INSERT INTO clubes (nombre, siglas, estado, color)
    SELECT 'Club Nacional de Senderismo y Balística', 'CNSB', 'afiliado', '#1E40AF'
    WHERE NOT EXISTS (SELECT 1 FROM clubes WHERE siglas = 'CNSB');

    INSERT INTO clubes (nombre, siglas, estado, color)
    SELECT 'Club de Tiro Guaraní', 'CTG', 'afiliado', '#DC2626'
    WHERE NOT EXISTS (SELECT 1 FROM clubes WHERE siglas = 'CTG');

    INSERT INTO clubes (nombre, siglas, estado, color)
    SELECT 'Club de Tiro y Pesca del Paraguay', 'CPTP', 'afiliado', '#B45309'
    WHERE NOT EXISTS (SELECT 1 FROM clubes WHERE siglas = 'CPTP');

    INSERT INTO clubes (nombre, siglas, estado, color)
    SELECT 'Club de Tiro, Caza, Ornitología y Fomento', 'CTCOF', 'afiliado', '#CA8A04'
    WHERE NOT EXISTS (SELECT 1 FROM clubes WHERE siglas = 'CTCOF');

    INSERT INTO clubes (nombre, siglas, estado, color)
    SELECT 'Club de Cazadores', 'CC', 'afiliado', '#059669'
    WHERE NOT EXISTS (SELECT 1 FROM clubes WHERE siglas = 'CC');

    -- ═══════════════════════════════════════════
    -- 4. Insert TRAP AMERICANO Events (7 fechas)
    -- ═══════════════════════════════════════════

    -- 1a Fecha: 21/03/26 - CNSB
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_trap, v_tipo_puntuable, '1a Fecha - Trap Americano', '2026-03-21', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CNSB');

    -- 2a Fecha: 09/05/26 - CTG (posible 16/05)
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_trap, v_tipo_puntuable, '2a Fecha - Trap Americano', '2026-05-09', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CTG. Fecha alternativa: 16 de mayo.');

    -- 3a Fecha: 18/07/26 - CPTP
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_trap, v_tipo_puntuable, '3a Fecha - Trap Americano', '2026-07-18', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CPTP');

    -- 4a Fecha: 15/08/26 - CTCOF
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_trap, v_tipo_puntuable, '4a Fecha - Trap Americano', '2026-08-15', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CTCOF');

    -- 5a Fecha: 26/09/26 - CC
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_trap, v_tipo_puntuable, '5a Fecha - Trap Americano', '2026-09-26', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CC');

    -- 6a Fecha: 17/10/26 - CTG
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_trap, v_tipo_puntuable, '6a Fecha - Trap Americano', '2026-10-17', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CTG');

    -- 7a Fecha FINAL: 14/11/26 - CPTP
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_trap, v_tipo_puntuable, 'FINAL - Trap Americano', '2026-11-14', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CPTP. FINAL del calendario.');

    -- ═══════════════════════════════════════════
    -- 5. Insert HÉLICE Events (same 7 fechas)
    -- ═══════════════════════════════════════════

    -- 1a Fecha: 21/03/26 - CNSB
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_helice, v_tipo_puntuable, '1a Fecha - Hélice', '2026-03-21', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CNSB');

    -- 2a Fecha: 09/05/26 - CTG (posible 16/05)
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_helice, v_tipo_puntuable, '2a Fecha - Hélice', '2026-05-09', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CTG. Fecha alternativa: 16 de mayo.');

    -- 3a Fecha: 18/07/26 - CPTP
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_helice, v_tipo_puntuable, '3a Fecha - Hélice', '2026-07-18', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CPTP');

    -- 4a Fecha: 15/08/26 - CTCOF
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_helice, v_tipo_puntuable, '4a Fecha - Hélice', '2026-08-15', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CTCOF');

    -- 5a Fecha: 26/09/26 - CC
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_helice, v_tipo_puntuable, '5a Fecha - Hélice', '2026-09-26', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CC');

    -- 6a Fecha: 17/10/26 - CTG
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_helice, v_tipo_puntuable, '6a Fecha - Hélice', '2026-10-17', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CTG');

    -- 7a Fecha FINAL: 14/11/26 - CPTP
    INSERT INTO eventos (modalidad_id, tipo_evento_id, titulo, fecha, hora, ubicacion, ubicacion_url, descripcion)
    VALUES (v_mod_helice, v_tipo_puntuable, 'FINAL - Hélice', '2026-11-14', v_hora, v_ubicacion, v_ubicacion_url,
            'Club organizador: CPTP. FINAL del calendario.');

    RAISE NOTICE 'Imported 14 events (7 Trap Americano + 7 Helice) and 5 clubs successfully!';

END $$;
