-- Polla Mundialista - Supabase Schema
-- Ejecutar en el Editor SQL de Supabase

-- Tabla: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id TEXT UNIQUE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_datetime TIMESTAMPTZ NOT NULL,
  venue TEXT,
  country TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('group_stage', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final')),
  group_name TEXT,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'finished')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  match_id UUID NOT NULL REFERENCES matches(id),
  home_score_predicted INTEGER NOT NULL,
  away_score_predicted INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);

-- Tabla: admin_sync_log
CREATE TABLE admin_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_sync_at TIMESTAMPTZ,
  matches_updated INTEGER DEFAULT 0
);

-- Tabla: special_bets (campeon y goleador)
CREATE TABLE special_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  champion TEXT,
  top_scorer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: tournament_settings (valores reales puestos por admin)
CREATE TABLE tournament_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_matches_datetime ON matches(match_datetime);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);

-- Política RLS (Row Level Security) - opcional para desarrollo
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Permisos basic
-- GRANT ALL ON users TO authenticated;
-- GRANT ALL ON matches TO authenticated;
-- GRANT ALL ON predictions TO authenticated;
-- GRANT ALL ON admin_sync_log TO authenticated;

-- Deshabilitar RLS en tablas nuevas (service_role bypass RLS)
ALTER TABLE special_bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_settings DISABLE ROW LEVEL SECURITY;