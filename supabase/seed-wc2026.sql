-- =============================================================
-- WORLD CUP 2026 - TODOS LOS PARTIDOS
-- Ejecutar en el Editor SQL de Supabase
-- =============================================================

-- Agregar columna country si no existe
DO $$ BEGIN
  ALTER TABLE matches ADD COLUMN country TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Crear tablas de apuestas especiales si no existen
CREATE TABLE IF NOT EXISTS special_bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) UNIQUE,
    champion TEXT,
    top_scorer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE special_bets DISABLE ROW LEVEL SECURITY;

GRANT ALL ON special_bets TO service_role;

GRANT ALL ON special_bets TO authenticated;

GRANT ALL ON special_bets TO anon;

CREATE TABLE IF NOT EXISTS tournament_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tournament_settings DISABLE ROW LEVEL SECURITY;

GRANT ALL ON tournament_settings TO service_role;

GRANT ALL ON tournament_settings TO authenticated;

GRANT ALL ON tournament_settings TO anon;

-- Limpiar datos anteriores
TRUNCATE predictions,
matches,
admin_sync_log,
special_bets,
tournament_settings CASCADE;

-- =============================================================
-- PRIMERA RONDA - JORNADA 1 (72 partidos total, 24 esta jornada)
-- Horas en UTC
-- =============================================================
INSERT INTO
    matches (
        id,
        api_id,
        home_team,
        away_team,
        match_datetime,
        venue,
        country,
        stage,
        group_name,
        status
    )
VALUES
    -- Jun 11
    (
        '00000000-0000-0000-0000-000000000001',
        'WC26-M001',
        'México',
        'Sudáfrica',
        '2026-06-11T19:00:00Z',
        'Estadio Azteca',
        'México',
        'group_stage',
        'Grupo A',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'WC26-M002',
        'Corea del Sur',
        'República Checa',
        '2026-06-12T02:00:00Z',
        'Estadio Akron',
        'México',
        'group_stage',
        'Grupo A',
        'pending'
    ),
    -- Jun 12
    (
        '00000000-0000-0000-0000-000000000003',
        'WC26-M003',
        'Canadá',
        'Bosnia y Herzegovina',
        '2026-06-12T19:00:00Z',
        'BMO Field',
        'Canadá',
        'group_stage',
        'Grupo B',
        'pending'
    ),
    -- Jun 13
    (
        '00000000-0000-0000-0000-000000000004',
        'WC26-M004',
        'Estados Unidos',
        'Paraguay',
        '2026-06-13T01:00:00Z',
        'SoFi Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo D',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'WC26-M005',
        'Qatar',
        'Suiza',
        '2026-06-13T19:00:00Z',
        'Levis Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo B',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000006',
        'WC26-M006',
        'Brasil',
        'Marruecos',
        '2026-06-13T22:00:00Z',
        'MetLife Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo C',
        'pending'
    ),
    -- Jun 14
    (
        '00000000-0000-0000-0000-000000000007',
        'WC26-M007',
        'Haití',
        'Escocia',
        '2026-06-14T01:00:00Z',
        'Gillette Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo C',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000008',
        'WC26-M008',
        'Australia',
        'Turquia',
        '2026-06-14T04:00:00Z',
        'BC Place',
        'Canadá',
        'group_stage',
        'Grupo D',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000009',
        'WC26-M009',
        'Alemania',
        'Curazao',
        '2026-06-14T17:00:00Z',
        'NRG Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo E',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000010',
        'WC26-M010',
        'Paises Bajos',
        'Japón',
        '2026-06-14T20:00:00Z',
        'AT&T Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo F',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000011',
        'WC26-M011',
        'Costa de Marfil',
        'Ecuador',
        '2026-06-14T23:00:00Z',
        'Lincoln Financial Field',
        'Estados Unidos',
        'group_stage',
        'Grupo E',
        'pending'
    ),
    -- Jun 15
    (
        '00000000-0000-0000-0000-000000000012',
        'WC26-M012',
        'Túnez',
        'Suecia',
        '2026-06-15T02:00:00Z',
        'Estadio BBVA',
        'México',
        'group_stage',
        'Grupo F',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000013',
        'WC26-M013',
        'España',
        'Cabo Verde',
        '2026-06-15T16:00:00Z',
        'Mercedes-Benz Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo H',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000014',
        'WC26-M014',
        'Bélgica',
        'Egipto',
        '2026-06-15T19:00:00Z',
        'Lumen Field',
        'Estados Unidos',
        'group_stage',
        'Grupo G',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000015',
        'WC26-M015',
        'Arabia Saudita',
        'Uruguay',
        '2026-06-15T22:00:00Z',
        'Hard Rock Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo H',
        'pending'
    ),
    -- Jun 16
    (
        '00000000-0000-0000-0000-000000000016',
        'WC26-M016',
        'Irán',
        'Nueva Zelanda',
        '2026-06-16T01:00:00Z',
        'SoFi Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo G',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000017',
        'WC26-M017',
        'Francia',
        'Senegal',
        '2026-06-16T19:00:00Z',
        'MetLife Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo I',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000018',
        'WC26-M018',
        'Irak',
        'Noruega',
        '2026-06-16T22:00:00Z',
        'Gillette Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo I',
        'pending'
    ),
    -- Jun 17
    (
        '00000000-0000-0000-0000-000000000019',
        'WC26-M019',
        'Argentina',
        'Argelia',
        '2026-06-17T01:00:00Z',
        'GEHA Field at Arrowhead',
        'Estados Unidos',
        'group_stage',
        'Grupo J',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000020',
        'WC26-M020',
        'Austria',
        'Jordania',
        '2026-06-17T04:00:00Z',
        'Levis Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo J',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000021',
        'WC26-M021',
        'Portugal',
        'RD Congo',
        '2026-06-17T17:00:00Z',
        'NRG Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo K',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000022',
        'WC26-M022',
        'Inglaterra',
        'Croacia',
        '2026-06-17T20:00:00Z',
        'AT&T Stadium',
        'Estados Unidos',
        'group_stage',
        'Grupo L',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000023',
        'WC26-M023',
        'Ghana',
        'Panamá',
        '2026-06-17T23:00:00Z',
        'BMO Field',
        'Canadá',
        'group_stage',
        'Grupo L',
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000024',
        'WC26-M024',
        'Uzbekistán',
        'Colombia',
        '2026-06-18T02:00:00Z',
        'Estadio Azteca',
        'México',
        'group_stage',
        'Grupo K',
        'pending'
    ),

-- =============================================================
-- PRIMERA RONDA - JORNADA 2
-- =============================================================
-- Jun 18
(
    '00000000-0000-0000-0000-000000000025',
    'WC26-M025',
    'República Checa',
    'Sudáfrica',
    '2026-06-18T16:00:00Z',
    'Mercedes-Benz Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo A',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000026',
    'WC26-M026',
    'Suiza',
    'Bosnia y Herzegovina',
    '2026-06-18T19:00:00Z',
    'SoFi Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo B',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000027',
    'WC26-M027',
    'Canadá',
    'Qatar',
    '2026-06-18T22:00:00Z',
    'BC Place',
    'Canadá',
    'group_stage',
    'Grupo B',
    'pending'
),
-- Jun 19
(
    '00000000-0000-0000-0000-000000000028',
    'WC26-M028',
    'México',
    'Corea del Sur',
    '2026-06-19T01:00:00Z',
    'Estadio Akron',
    'México',
    'group_stage',
    'Grupo A',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000029',
    'WC26-M029',
    'Escocia',
    'Marruecos',
    '2026-06-19T19:00:00Z',
    'Gillette Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo C',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000030',
    'WC26-M030',
    'Estados Unidos',
    'Australia',
    '2026-06-19T19:00:00Z',
    'Lumen Field',
    'Estados Unidos',
    'group_stage',
    'Grupo D',
    'pending'
),
-- Jun 20
(
    '00000000-0000-0000-0000-000000000031',
    'WC26-M031',
    'Brasil',
    'Haití',
    '2026-06-20T01:00:00Z',
    'Lincoln Financial Field',
    'Estados Unidos',
    'group_stage',
    'Grupo C',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000032',
    'WC26-M032',
    'Turquia',
    'Paraguay',
    '2026-06-20T04:00:00Z',
    'Levis Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo D',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000033',
    'WC26-M033',
    'Paises Bajos',
    'Suecia',
    '2026-06-20T17:00:00Z',
    'NRG Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo F',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000034',
    'WC26-M034',
    'Alemania',
    'Costa de Marfil',
    '2026-06-20T20:00:00Z',
    'BMO Field',
    'Canadá',
    'group_stage',
    'Grupo E',
    'pending'
),
-- Jun 21
(
    '00000000-0000-0000-0000-000000000035',
    'WC26-M035',
    'Ecuador',
    'Curazao',
    '2026-06-21T00:00:00Z',
    'GEHA Field at Arrowhead',
    'Estados Unidos',
    'group_stage',
    'Grupo E',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000036',
    'WC26-M036',
    'Túnez',
    'Japón',
    '2026-06-21T04:00:00Z',
    'Estadio BBVA',
    'México',
    'group_stage',
    'Grupo F',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000037',
    'WC26-M037',
    'España',
    'Arabia Saudita',
    '2026-06-21T16:00:00Z',
    'Mercedes-Benz Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo H',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000038',
    'WC26-M038',
    'Bélgica',
    'Irán',
    '2026-06-21T19:00:00Z',
    'SoFi Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo G',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000039',
    'WC26-M039',
    'Uruguay',
    'Cabo Verde',
    '2026-06-21T22:00:00Z',
    'Hard Rock Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo H',
    'pending'
),
-- Jun 22
(
    '00000000-0000-0000-0000-000000000040',
    'WC26-M040',
    'Nueva Zelanda',
    'Egipto',
    '2026-06-22T01:00:00Z',
    'BC Place',
    'Canadá',
    'group_stage',
    'Grupo G',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000041',
    'WC26-M041',
    'Argentina',
    'Austria',
    '2026-06-22T17:00:00Z',
    'AT&T Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo J',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000042',
    'WC26-M042',
    'Francia',
    'Irak',
    '2026-06-22T21:00:00Z',
    'Lincoln Financial Field',
    'Estados Unidos',
    'group_stage',
    'Grupo I',
    'pending'
),
-- Jun 23
(
    '00000000-0000-0000-0000-000000000043',
    'WC26-M043',
    'Noruega',
    'Senegal',
    '2026-06-23T00:00:00Z',
    'MetLife Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo I',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000044',
    'WC26-M044',
    'Jordania',
    'Argelia',
    '2026-06-23T03:00:00Z',
    'Levis Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo J',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000045',
    'WC26-M045',
    'Portugal',
    'Uzbekistán',
    '2026-06-23T17:00:00Z',
    'NRG Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo K',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000046',
    'WC26-M046',
    'Inglaterra',
    'Ghana',
    '2026-06-23T20:00:00Z',
    'Gillette Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo L',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000047',
    'WC26-M047',
    'Panamá',
    'Croacia',
    '2026-06-23T23:00:00Z',
    'BMO Field',
    'Canadá',
    'group_stage',
    'Grupo L',
    'pending'
),
-- Jun 24
(
    '00000000-0000-0000-0000-000000000048',
    'WC26-M048',
    'Colombia',
    'RD Congo',
    '2026-06-24T02:00:00Z',
    'Estadio Akron',
    'México',
    'group_stage',
    'Grupo K',
    'pending'
),

-- =============================================================
-- PRIMERA RONDA - JORNADA 3
-- =============================================================
-- Jun 24
(
    '00000000-0000-0000-0000-000000000049',
    'WC26-M049',
    'Suiza',
    'Canadá',
    '2026-06-24T19:00:00Z',
    'BC Place',
    'Canadá',
    'group_stage',
    'Grupo B',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000050',
    'WC26-M050',
    'Bosnia y Herzegovina',
    'Qatar',
    '2026-06-24T19:00:00Z',
    'Lumen Field',
    'Estados Unidos',
    'group_stage',
    'Grupo B',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000051',
    'WC26-M051',
    'Brasil',
    'Escocia',
    '2026-06-24T22:00:00Z',
    'Hard Rock Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo C',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000052',
    'WC26-M052',
    'Marruecos',
    'Haití',
    '2026-06-24T22:00:00Z',
    'Mercedes-Benz Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo C',
    'pending'
),
-- Jun 25
(
    '00000000-0000-0000-0000-000000000053',
    'WC26-M053',
    'México',
    'República Checa',
    '2026-06-25T01:00:00Z',
    'Estadio Azteca',
    'México',
    'group_stage',
    'Grupo A',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000054',
    'WC26-M054',
    'Sudáfrica',
    'Corea del Sur',
    '2026-06-25T01:00:00Z',
    'Estadio BBVA',
    'México',
    'group_stage',
    'Grupo A',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000055',
    'WC26-M055',
    'Ecuador',
    'Alemania',
    '2026-06-25T20:00:00Z',
    'MetLife Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo E',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000056',
    'WC26-M056',
    'Curazao',
    'Costa de Marfil',
    '2026-06-25T20:00:00Z',
    'Lincoln Financial Field',
    'Estados Unidos',
    'group_stage',
    'Grupo E',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000057',
    'WC26-M057',
    'Túnez',
    'Paises Bajos',
    '2026-06-25T23:00:00Z',
    'GEHA Field at Arrowhead',
    'Estados Unidos',
    'group_stage',
    'Grupo F',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000058',
    'WC26-M058',
    'Japón',
    'Suecia',
    '2026-06-25T23:00:00Z',
    'AT&T Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo F',
    'pending'
),
-- Jun 26
(
    '00000000-0000-0000-0000-000000000059',
    'WC26-M059',
    'Estados Unidos',
    'Turquia',
    '2026-06-26T02:00:00Z',
    'SoFi Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo D',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000060',
    'WC26-M060',
    'Paraguay',
    'Australia',
    '2026-06-26T02:00:00Z',
    'Levis Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo D',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000061',
    'WC26-M061',
    'Noruega',
    'Francia',
    '2026-06-26T19:00:00Z',
    'Gillette Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo I',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000062',
    'WC26-M062',
    'Senegal',
    'Irak',
    '2026-06-26T19:00:00Z',
    'BMO Field',
    'Canadá',
    'group_stage',
    'Grupo I',
    'pending'
),
-- Jun 27
(
    '00000000-0000-0000-0000-000000000063',
    'WC26-M063',
    'Uruguay',
    'España',
    '2026-06-27T00:00:00Z',
    'Estadio Akron',
    'México',
    'group_stage',
    'Grupo H',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000064',
    'WC26-M064',
    'Cabo Verde',
    'Arabia Saudita',
    '2026-06-27T00:00:00Z',
    'NRG Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo H',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000065',
    'WC26-M065',
    'Nueva Zelanda',
    'Bélgica',
    '2026-06-27T03:00:00Z',
    'BC Place',
    'Canadá',
    'group_stage',
    'Grupo G',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000066',
    'WC26-M066',
    'Egipto',
    'Irán',
    '2026-06-27T03:00:00Z',
    'Lumen Field',
    'Estados Unidos',
    'group_stage',
    'Grupo G',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000067',
    'WC26-M067',
    'Panamá',
    'Inglaterra',
    '2026-06-27T21:00:00Z',
    'MetLife Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo L',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000068',
    'WC26-M068',
    'Croacia',
    'Ghana',
    '2026-06-27T21:00:00Z',
    'Lincoln Financial Field',
    'Estados Unidos',
    'group_stage',
    'Grupo L',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000069',
    'WC26-M069',
    'Colombia',
    'Portugal',
    '2026-06-27T23:30:00Z',
    'Hard Rock Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo K',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000070',
    'WC26-M070',
    'RD Congo',
    'Uzbekistán',
    '2026-06-27T23:30:00Z',
    'Mercedes-Benz Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo K',
    'pending'
),
-- Jun 28
(
    '00000000-0000-0000-0000-000000000071',
    'WC26-M071',
    'Argentina',
    'Jordania',
    '2026-06-28T02:00:00Z',
    'AT&T Stadium',
    'Estados Unidos',
    'group_stage',
    'Grupo J',
    'pending'
),
(
    '00000000-0000-0000-0000-000000000072',
    'WC26-M072',
    'Argelia',
    'Austria',
    '2026-06-28T02:00:00Z',
    'GEHA Field at Arrowhead',
    'Estados Unidos',
    'group_stage',
    'Grupo J',
    'pending'
);

-- =============================================================
-- OCTAVOS DE FINAL - ROUND OF 32 (16 partidos)
-- =============================================================
INSERT INTO
    matches (
        id,
        api_id,
        home_team,
        away_team,
        match_datetime,
        venue,
        country,
        stage,
        group_name,
        status
    )
VALUES (
        '00000000-0000-0000-0000-000000000073',
        'WC26-M073',
        '2A',
        '2B',
        '2026-06-28T19:00:00Z',
        'SoFi Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000074',
        'WC26-M074',
        '1E',
        '3ABCDF',
        '2026-06-29T20:30:00Z',
        'Gillette Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000075',
        'WC26-M075',
        '1F',
        '2C',
        '2026-06-30T01:00:00Z',
        'Estadio BBVA',
        'México',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000076',
        'WC26-M076',
        '1C',
        '2F',
        '2026-06-29T17:00:00Z',
        'NRG Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000077',
        'WC26-M077',
        '1I',
        '3CDFGH',
        '2026-06-30T21:00:00Z',
        'MetLife Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000078',
        'WC26-M078',
        '2E',
        '2I',
        '2026-06-30T17:00:00Z',
        'AT&T Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000079',
        'WC26-M079',
        '1A',
        '3CEFHI',
        '2026-07-01T01:00:00Z',
        'Estadio Azteca',
        'México',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000080',
        'WC26-M080',
        '1L',
        '3EHIJK',
        '2026-07-01T16:00:00Z',
        'Mercedes-Benz Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000081',
        'WC26-M081',
        '1D',
        '3BEFIJ',
        '2026-07-02T00:00:00Z',
        'Levis Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000082',
        'WC26-M082',
        '1G',
        '3AEHIJ',
        '2026-07-02T04:00:00Z',
        'Lumen Field',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000083',
        'WC26-M083',
        '2K',
        '2L',
        '2026-07-03T03:00:00Z',
        'BMO Field',
        'Canadá',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000084',
        'WC26-M084',
        '1H',
        '2J',
        '2026-07-03T00:00:00Z',
        'SoFi Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000085',
        'WC26-M085',
        '1B',
        '3EFGIJ',
        '2026-07-03T04:00:00Z',
        'BC Place',
        'Canadá',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000086',
        'WC26-M086',
        '1J',
        '2H',
        '2026-07-04T02:00:00Z',
        'Hard Rock Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000087',
        'WC26-M087',
        '1K',
        '3DEIJL',
        '2026-07-04T01:30:00Z',
        'GEHA Field at Arrowhead',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000088',
        'WC26-M088',
        '2D',
        '2G',
        '2026-07-04T00:00:00Z',
        'AT&T Stadium',
        'Estados Unidos',
        'round_of_32',
        NULL,
        'pending'
    );

-- =============================================================
-- OCTAVOS DE FINAL - ROUND OF 16 (8 partidos)
-- =============================================================
INSERT INTO
    matches (
        id,
        api_id,
        home_team,
        away_team,
        match_datetime,
        venue,
        country,
        stage,
        group_name,
        status
    )
VALUES (
        '00000000-0000-0000-0000-000000000089',
        'WC26-M089',
        'Ganador 74',
        'Ganador 77',
        '2026-07-04T20:00:00Z',
        'Lincoln Financial Field',
        'Estados Unidos',
        'round_of_16',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000090',
        'WC26-M090',
        'Ganador 73',
        'Ganador 75',
        '2026-07-05T00:00:00Z',
        'NRG Stadium',
        'Estados Unidos',
        'round_of_16',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000091',
        'WC26-M091',
        'Ganador 76',
        'Ganador 78',
        '2026-07-05T04:00:00Z',
        'MetLife Stadium',
        'Estados Unidos',
        'round_of_16',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000092',
        'WC26-M092',
        'Ganador 79',
        'Ganador 80',
        '2026-07-06T20:00:00Z',
        'Estadio Azteca',
        'México',
        'round_of_16',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000093',
        'WC26-M093',
        'Ganador 83',
        'Ganador 84',
        '2026-07-07T00:00:00Z',
        'AT&T Stadium',
        'Estados Unidos',
        'round_of_16',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000094',
        'WC26-M094',
        'Ganador 81',
        'Ganador 82',
        '2026-07-07T04:00:00Z',
        'Lumen Field',
        'Estados Unidos',
        'round_of_16',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000095',
        'WC26-M095',
        'Ganador 86',
        'Ganador 87',
        '2026-07-08T00:00:00Z',
        'Mercedes-Benz Stadium',
        'Estados Unidos',
        'round_of_16',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000096',
        'WC26-M096',
        'Ganador 85',
        'Ganador 88',
        '2026-07-08T04:00:00Z',
        'BC Place',
        'Canadá',
        'round_of_16',
        NULL,
        'pending'
    );

-- =============================================================
-- CUARTOS DE FINAL (4 partidos)
-- =============================================================
INSERT INTO
    matches (
        id,
        api_id,
        home_team,
        away_team,
        match_datetime,
        venue,
        country,
        stage,
        group_name,
        status
    )
VALUES (
        '00000000-0000-0000-0000-000000000097',
        'WC26-M097',
        'Ganador 89',
        'Ganador 90',
        '2026-07-10T00:00:00Z',
        'Gillette Stadium',
        'Estados Unidos',
        'quarter_final',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000098',
        'WC26-M098',
        'Ganador 93',
        'Ganador 94',
        '2026-07-11T00:00:00Z',
        'SoFi Stadium',
        'Estados Unidos',
        'quarter_final',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000099',
        'WC26-M099',
        'Ganador 91',
        'Ganador 92',
        '2026-07-12T00:00:00Z',
        'Hard Rock Stadium',
        'Estados Unidos',
        'quarter_final',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000100',
        'WC26-M100',
        'Ganador 95',
        'Ganador 96',
        '2026-07-12T04:00:00Z',
        'GEHA Field at Arrowhead',
        'Estados Unidos',
        'quarter_final',
        NULL,
        'pending'
    );

-- =============================================================
-- SEMIFINALES (2 partidos)
-- =============================================================
INSERT INTO
    matches (
        id,
        api_id,
        home_team,
        away_team,
        match_datetime,
        venue,
        country,
        stage,
        group_name,
        status
    )
VALUES (
        '00000000-0000-0000-0000-000000000101',
        'WC26-M101',
        'Ganador 97',
        'Ganador 98',
        '2026-07-15T00:00:00Z',
        'AT&T Stadium',
        'Estados Unidos',
        'semi_final',
        NULL,
        'pending'
    ),
    (
        '00000000-0000-0000-0000-000000000102',
        'WC26-M102',
        'Ganador 99',
        'Ganador 100',
        '2026-07-16T00:00:00Z',
        'Mercedes-Benz Stadium',
        'Estados Unidos',
        'semi_final',
        NULL,
        'pending'
    );

-- =============================================================
-- TERCER PUESTO
-- =============================================================
INSERT INTO
    matches (
        id,
        api_id,
        home_team,
        away_team,
        match_datetime,
        venue,
        country,
        stage,
        group_name,
        status
    )
VALUES (
        '00000000-0000-0000-0000-000000000103',
        'WC26-M103',
        'Perdedor 101',
        'Perdedor 102',
        '2026-07-19T01:00:00Z',
        'Hard Rock Stadium',
        'Estados Unidos',
        'third_place',
        NULL,
        'pending'
    );

-- =============================================================
-- GRAN FINAL
-- =============================================================
INSERT INTO
    matches (
        id,
        api_id,
        home_team,
        away_team,
        match_datetime,
        venue,
        country,
        stage,
        group_name,
        status
    )
VALUES (
        '00000000-0000-0000-0000-000000000104',
        'WC26-M104',
        'Ganador 101',
        'Ganador 102',
        '2026-07-20T00:00:00Z',
        'MetLife Stadium',
        'Estados Unidos',
        'final',
        NULL,
        'pending'
    );
