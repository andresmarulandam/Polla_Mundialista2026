import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

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
  const [matchesResult, specialBetResult, predictionsResult] =
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
    ]);

  console.timeEnd('SSR HomePage');

  const allMatches = matchesResult.data || [];
  const predictions = predictionsResult.data || [];

  const predictionMap = new Map<string, any>();
  predictions.forEach((p: any) => predictionMap.set(p.match_id, p));

  const matchesWithPrediction = allMatches.map((m: any) => ({
    ...m,
    user_prediction: predictionMap.get(m.id) || null,
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
    />
  );
}
