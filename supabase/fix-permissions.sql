-- Ejecutar esto en el Editor SQL de Supabase para arreglar permisos
-- Copiar y pegar directamente

-- Crear tablas si no existen
CREATE TABLE IF NOT EXISTS special_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  champion TEXT,
  top_scorer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS
ALTER TABLE special_bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_settings DISABLE ROW LEVEL SECURITY;

-- Dar permisos a service_role
GRANT ALL ON special_bets TO service_role;
GRANT ALL ON tournament_settings TO service_role;
GRANT ALL ON special_bets TO authenticated;
GRANT ALL ON tournament_settings TO authenticated;
GRANT ALL ON special_bets TO anon;
GRANT ALL ON tournament_settings TO anon;
