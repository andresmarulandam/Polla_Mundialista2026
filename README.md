# Polla Mundialista 2026

Pool de apuestas familiar para el Mundial 2026.

## Configuración

### 1. Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir al SQL Editor y ejecutar el contenido de `supabase/schema.sql`
3. Obtener las credenciales:
   - URL del proyecto
   - ANON KEY (Settings → API)
   - SERVICE ROLE KEY (Settings → API)

### 2. Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SESSION_SECRET=una_contraseña_larga_32_chars
```

### 3. Instalar y ejecutar

```bash
npm install
npm run dev
```

### 4. Deploy en Vercel

1. Conectar repositorio a Vercel
2. Agregar las variables de entorno en Settings
3. Deploy automatico

## Uso

1. **Registro**: Ir a `/login` y crear cuenta (nombre + 4 dígitos)
2. **Predicciones**: En la home, llenar Scores y dar "Predecir"
3. **Resultados**: Cuando la API sync, ver puntos ganados
4. **Tabla**: Ver `/standings` para posiciones
5. **Admin**: Panel en `/admin` (solo admin)

## Scoring

- Score exacto: 5 puntos (10 en knockout)
- Ganador/draw correcto: 3 puntos (6 en knockout)
- Resultado incorrecto: 0 puntos