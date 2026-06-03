import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { normalize } from '@/lib/api';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token)
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const session = await verifySession(token);
  if (!session?.is_admin)
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { data: bets, error: betsError } = await supabaseAdmin
    .from('special_bets')
    .select('*');

  if (betsError)
    return NextResponse.json({ error: betsError.message }, { status: 500 });

  const { data: users } = await supabaseAdmin.from('users').select('id, name');

  const userMap = new Map(users?.map((u) => [u.id, u.name]) || []);

  const { data: settings } = await supabaseAdmin
    .from('tournament_settings')
    .select('*');

  const settingsMap: Record<string, string | null> = {};
  settings?.forEach((s) => {
    settingsMap[s.setting_key] = s.setting_value;
  });

  const betsWithNames =
    bets?.map((bet) => ({
      ...bet,
      user_name: userMap.get(bet.user_id) || 'Desconocido',
      is_champion_correct:
        settingsMap['champion'] && bet.champion === settingsMap['champion'],
      is_scorer_correct:
        settingsMap['top_scorer'] &&
        bet.top_scorer &&
        normalize(bet.top_scorer) === normalize(settingsMap['top_scorer']),
    })) || [];

  return NextResponse.json({
    bets: betsWithNames,
    actualChampion: settingsMap['champion'] || null,
    actualTopScorer: settingsMap['top_scorer'] || null,
  });
}
