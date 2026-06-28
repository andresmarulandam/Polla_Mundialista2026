import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  console.time('SSR HomePage');
  const cookieStore = cookies();
  const token = cookieStore.get('session')?.value;

  console.log('TOKEN EXISTS:', !!token);

  if (!token) {
    redirect('/login');
  }

  const session = await verifySession(token);
  if (!session) {
    redirect('/login');
  }

  // Fetch all data in parallel on the server
  const [matchesResult, specialBetResult, predictionsResult, usersResult, allSpecialBetsResult] =
    await Promise.all([
      supabaseAdmin
        .from('matches')
        .select('*')
        .order('match_datetime', { ascending: true }),
      supabaseAdmin
        .from('special_bets')
        .select('*')
        .eq('user_id', session.id)
        .maybeSingle(),
      supabaseAdmin.from('predictions').select('*').eq('user_id', session.id),
      supabaseAdmin.from('users').select('id, name'),
      supabaseAdmin.from('special_bets').select('*'),
    ]);

  // Fetch all predictions in batches (Supabase limits to 1000 rows per query)
  const allPredictions: any[] = [];
  let offset = 0;
  const batchSize = 1000;
  while (true) {
    const { data } = await supabaseAdmin
      .from('predictions')
      .select('*')
      .range(offset, offset + batchSize - 1);
    if (!data || data.length === 0) break;
    allPredictions.push(...data);
    if (data.length < batchSize) break;
    offset += batchSize;
  }

  console.timeEnd('SSR HomePage');

  const allMatches = matchesResult.data || [];
  const predictions = predictionsResult.data || [];
  const users = usersResult.data || [];
  const allSpecialBets = allSpecialBetsResult.data || [];

  const userMap = new Map<string, string>();
  users.forEach((u: any) => userMap.set(u.id, u.name));

  const predictionMap = new Map<string, any>();
  predictions.forEach((p: any) => predictionMap.set(p.match_id, p));

  // Group all predictions by match_id
  const predictionsByMatch = new Map<string, any[]>();
  allPredictions.forEach((p: any) => {
    const existing = predictionsByMatch.get(p.match_id) || [];
    existing.push({ ...p, user_name: userMap.get(p.user_id) || 'Anonimo' });
    predictionsByMatch.set(p.match_id, existing);
  });

  const matchesWithPrediction = allMatches.map((m: any) => ({
    ...m,
    user_prediction: predictionMap.get(m.id) || null,
    other_predictions: predictionsByMatch.get(m.id) || [],
  }));

  const otherSpecialBets = allSpecialBets.map((sb: any) => ({
    user_name: userMap.get(sb.user_id) || 'Anonimo',
    champion: sb.champion,
    top_scorer: sb.top_scorer,
  }));

  return (
    <HomeClient
      session={{
        id: session.id,
        name: session.name,
        is_admin: session.is_admin,
      }}
      initialMatches={matchesWithPrediction}
      initialSpecialBet={specialBetResult.data || null}
      otherSpecialBets={otherSpecialBets}
    />
  );
}
