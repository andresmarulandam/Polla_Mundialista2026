import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const session = await verifySession(token);

  if (!session) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }

  const { data: predictions } = await supabaseAdmin
    .from('predictions')
    .select('*');

  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select('*');

  if (!predictions || !matches) {
    return NextResponse.json({ standings: [] });
  }

  const userStats = new Map<string, { totalPoints: number; exactCount: number }>();

  predictions.forEach((pred) => {
    const match = matches.find(m => m.id === pred.match_id);
    if (!match) return;

    const isExact = 
      pred.home_score_predicted === match.home_score && 
      pred.away_score_predicted === match.away_score &&
      match.home_score != null;

    const isKnockout = match.stage !== 'group_stage';
    const multiplier = isKnockout ? 2 : 1;
    const points = isExact ? 5 * multiplier : (pred.points_earned || 0);

    const existing = userStats.get(pred.user_id) || { totalPoints: 0, exactCount: 0 };
    userStats.set(pred.user_id, {
      totalPoints: existing.totalPoints + points,
      exactCount: existing.exactCount + (isExact ? 1 : 0),
    });
  });

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name');

  const userMap = new Map(users?.map(u => [u.id, u.name]) || []);

  const standings = Array.from(userStats.entries())
    .map(([userId, stats]) => ({
      rank: 0,
      user_id: userId,
      user_name: userMap.get(userId) || 'Unknown',
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