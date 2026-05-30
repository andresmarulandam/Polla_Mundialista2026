import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { calculatePoints, normalize } from '@/lib/api';
import { MatchStage } from '@/lib/types';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const session = await verifySession(token);

  if (!session) {
    return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 });
  }

  const { data: predictions } = await supabaseAdmin
    .from('predictions')
    .select('*');

  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select('*');

  const { data: specialBets } = await supabaseAdmin
    .from('special_bets')
    .select('*');

  const { data: settings } = await supabaseAdmin
    .from('tournament_settings')
    .select('*');

  if (!predictions || !matches) {
    return NextResponse.json({ standings: [] });
  }

  // Build settings map
  const settingsMap: Record<string, string | null> = {};
  settings?.forEach((s) => { settingsMap[s.setting_key] = s.setting_value; });

  const actualChampion = settingsMap['champion'] || null;
  const actualTopScorer = settingsMap['top_scorer'] || null;

  // Build special bets map
  const specialBetsMap = new Map<string, { champion: string | null; top_scorer: string | null }>();
  specialBets?.forEach((sb) => {
    specialBetsMap.set(sb.user_id, { champion: sb.champion, top_scorer: sb.top_scorer });
  });

  const userStats = new Map<string, { totalPoints: number; exactCount: number }>();

  // Calculate match points
  predictions.forEach((pred) => {
    const match = matches.find(m => m.id === pred.match_id);
    if (!match) return;
    if (match.home_score == null || match.away_score == null) return;

    const points = calculatePoints(
      pred.home_score_predicted,
      pred.away_score_predicted,
      match.home_score,
      match.away_score,
      match.stage as MatchStage
    );

    const isExact =
      pred.home_score_predicted === match.home_score &&
      pred.away_score_predicted === match.away_score;

    const existing = userStats.get(pred.user_id) || { totalPoints: 0, exactCount: 0 };
    userStats.set(pred.user_id, {
      totalPoints: existing.totalPoints + points,
      exactCount: existing.exactCount + (isExact ? 1 : 0),
    });
  });

  // Add special bet points (50 each)
  specialBets?.forEach((sb) => {
    const existing = userStats.get(sb.user_id) || { totalPoints: 0, exactCount: 0 };
    let bonus = 0;
    if (actualChampion && sb.champion === actualChampion) bonus += 50;
    if (actualTopScorer && sb.top_scorer && normalize(sb.top_scorer) === normalize(actualTopScorer)) bonus += 50;
    if (bonus > 0) {
      userStats.set(sb.user_id, {
        totalPoints: existing.totalPoints + bonus,
        exactCount: existing.exactCount,
      });
    }
  });

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name');

  const userMap = new Map(users?.map(u => [u.id, u.name]) || []);

  const standings = Array.from(userStats.entries())
    .map(([userId, stats]) => ({
      rank: 0,
      user_id: userId,
      user_name: userMap.get(userId) || 'Desconocido',
      total_points: stats.totalPoints,
      exact_predictions: stats.exactCount,
    }))
    .sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      return b.exact_predictions - a.exact_predictions;
    })
    .map((s, i) => ({ ...s, rank: i + 1 }));

  return NextResponse.json({ standings });
}
