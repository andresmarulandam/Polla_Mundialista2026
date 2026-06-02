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
    return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 });
  }

  // Fetch matches + predictions + special bets in parallel
  const [matchesResult, specialBetResult] = await Promise.all([
    supabaseAdmin
      .from('matches')
      .select('*')
      .order('match_datetime', { ascending: true }),
    supabaseAdmin
      .from('special_bets')
      .select('*')
      .eq('user_id', session.id)
      .maybeSingle(),
  ]);

  const allMatches = matchesResult.data || [];

  // Fetch user's predictions
  const { data: predictions } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('user_id', session.id);

  const predictionMap = new Map<string, any>();
  predictions?.forEach(p => predictionMap.set(p.match_id, p));

  const matchesWithPrediction = allMatches.map(m => ({
    ...m,
    user_prediction: predictionMap.get(m.id) || null,
  }));

  return NextResponse.json({
    session,
    matches: matchesWithPrediction,
    specialBet: specialBetResult.data || null,
  });
}
