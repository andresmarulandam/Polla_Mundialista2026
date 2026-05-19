# Polla Mundialista - World Cup Betting Pool

## Project Overview

- **Project Name**: Polla Mundialista
- **Project Type**: Next.js Web Application
- **Core Functionality**: Family betting pool for FIFA World Cup 2026 where participants predict match scores and earn points
- **Target Users**: Non-technical family members

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- Supabase (PostgreSQL)
- TheSportsDB API (free tier)
- Vercel (deployment)

## Database Schema (Supabase)

### Tabla: users
| Column | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| name | text | UNIQUE, NOT NULL |
| password_hash | text | NOT NULL |
| is_admin | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT NOW() |

### Tabla: matches
| Column | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| api_id | text | UNIQUE |
| home_team | text | NOT NULL |
| away_team | text | NOT NULL |
| match_datetime | timestamptz | NOT NULL |
| venue | text | |
| stage | text | NOT NULL, CHECK IN (group_stage, round_of_32, round_of_16, quarter_final, semi_final, third_place, final) |
| group_name | text | NULLABLE |
| home_score | int | NULLABLE |
| away_score | int | NULLABLE |
| status | text | DEFAULT 'pending', CHECK IN (pending, finished) |
| updated_at | timestamptz | DEFAULT NOW() |

### Tabla: predictions
| Column | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | FK → users(id), NOT NULL |
| match_id | uuid | FK → matches(id), NOT NULL |
| home_score_predicted | int | NOT NULL |
| away_score_predicted | int | NOT NULL |
| points_earned | int | DEFAULT 0 |
| created_at | timestamptz | DEFAULT NOW() |
| UNIQUE(user_id, match_id) | | |

### Tabla: admin_sync_log
| Column | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| last_sync_at | timestamptz | |
| matches_updated | int | DEFAULT 0 |

## Scoring Rules

| Outcome | Points |
|---------|--------|
| Exact score | 5 pts |
| Correct winner/draw (wrong score) | 3 pts |
| Wrong result | 0 pts |
| Knockout stages (stage != 'group_stage') | ×2 multiplier |

**Tie-breaker for standings**: Number of exact score predictions (descending)

## Prediction Deadlines

- **Group Stage**: 48 hours before match
- **Knockout**: Configurable in code (future feature)

## UI/UX Specification

### Color Palette
- Primary: #1a4731 (Verde Seleção - verde selección)
- Secondary: #f7b731 (Amarillo dorado)
- Accent: #e74c3c (Rojo pasión)
- Background: #0d1117 (Fondo oscuro)
- Surface: #161b22 (Tarjetas)
- Text Primary: #f0f6fc
- Text Secondary: #8b949e
- Success: #2ea043
- Error: #f85149

### Typography
- Font Family: Inter, system-ui, sans-serif
- Headings: Bold (700)
- H1: 2.5rem (40px)
- H2: 1.75rem (28px)
- H3: 1.25rem (20px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

### Layout
- Max container width: 1200px
- Padding: 16px mobile, 24px desktop
- Card border-radius: 12px
- Button border-radius: 8px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Components

#### Login Form
- Logo/title centered
- Name input (text)
- Password input (4 digits, masked)
- Submit button (primary color)
- Error message area

#### Match Card
- Team logos (flags via API)
- Team names
- VS separator
- Match datetime
- Venue
- Countdown timer ("Cierra en X")
- Prediction form (if open): home score, away score inputs + "Predecir" button
- Your prediction display (if already predicted)
- Real result (if finished)
- Points earned (if scored)

#### Stage Group Header
- Stage name in Spanish
- Expandable/collapsible

#### Standings Table
- Rank column
- User avatar (generated)
- User name
- Total points
- Exact predictions count
- Sort by points desc, exact count desc

#### Admin Panel
- Sync API button
- Last sync timestamp
- Users list
- Manual points recalculation

### Spanish Labels
- "Closes in X" → "Cierra en X"
- "Exact score" → "Score exacto"
- "Winner/draw correct" → "Ganador/draw correcto"
- "Wrong result" → "Resultado incorrecto"
- "Standings" → "Tabla de posiciones"
- "Upcoming" → "Próximos"
- "Finished" → "Finalizados"
- "Predict" → "Predecir"
- "Your prediction" → "Tu预测ción"
- "Points earned" → "Puntos ganados"

## Pages

### /login
- Centered card
- Title: "Polla Mundialista"
- Name input
- Password input (4 digits, type="password")
- Submit button: "Entrar"
- Optional: "Crear cuenta" link

### / (Home)
- Header with user name + "Cerrar Sesión" button
- Matches grouped by stage
- Each group collapsible
- Match cards as described

### /standings
- Simple table
- Columns: #, Nombre, Puntos, Exactos
- Tie-breaker: más exactos

### /admin
- Only accessible if is_admin=true
- Sync API button with loading state
- Last sync info
- Users table with delete option

## API Integration

### TheSportsDB Endpoints

**Base URL**: `https://www.thesportsdb.com/api/v1/json/123`

**Get season events**:
```
GET /events/season/4429/2026
```

Response fields to map:
- `strEvent` → display name
- `idEvent` → api_id
- `strHomeTeam` → home_team
- `strAwayTeam` → away_team
- `dateEvent` + `strTime` → match_datetime
- `strVenue` → venue
- `strGroup` → group_name
- `intHomeScore` → home_score
- `intAwayScore` → away_score
- `strStatus` → status (map to "pending"/"finished")

**Stage mapping**:
- Groups → "group_stage"
- Rounds → map based on round number or event name

### Sync Logic

1. Fetch all matches from TheSportsDB
2. Upsert into matches table (by api_id)
3. For finished matches, recalculate points for all predictions

## Authentication

- Simple session: store user_id in cookies (JWT)
- Password: 4-digit PIN, hashed with bcrypt
- Session expiry: 7 days

## Acceptance Criteria

1. ✅ User can register with name + 4-digit password
2. ✅ User can login with name + password
3. ✅ User sees all matches grouped by stage
4. ✅ User can predict upcoming matches (before deadline)
5. ✅ User sees their predictions for past matches
6. ✅ User sees real results + points earned for finished matches
7. ✅ Standings page shows all users sorted by points
8. ✅ Admin can sync API and see last sync time
9. ✅ UI is simple, large buttons, Spanish labels
10. ✅ Countdown shows time remaining to predict