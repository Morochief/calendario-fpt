-- ==============================================================================
-- 🔒 FPT Calendar: Security Patch - Public Club Dates
-- ==============================================================================
-- Este script soluciona una brecha menor de privacidad de datos donde la 
-- consulta select('*') en el frontend estaba enviando los numeros de telefono 
-- y nombres de contacto de los responsables de clubes al navegador de todos 
-- los visitantes anonimos.
-- ==============================================================================

-- 1. Crear una vista segura que SOLO expone datos publicos de los clubes
CREATE OR REPLACE VIEW clubes_publicos AS
SELECT 
    id,
    nombre,
    siglas,
    estado,
    color,
    logo_url,
    website_url
FROM clubes
WHERE estado IN ('afederado', 'pendiente', 'no_afederado');

-- 2. Asegurar que los roles publicos (anonimos) tengan permiso de ver la vista
GRANT SELECT ON clubes_publicos TO anon;
GRANT SELECT ON clubes_publicos TO authenticated;
