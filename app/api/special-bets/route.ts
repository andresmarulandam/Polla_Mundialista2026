import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token)
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const session = await verifySession(token);
  if (!session)
    return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('special_bets')
    .select('*')
    .eq('user_id', session.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ specialBet: data || null });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token)
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const session = await verifySession(token);
  if (!session)
    return NextResponse.json({ error: 'Sesion invalida' }, { status: 401 });

  try {
    const body = await request.json();
    const { champion, topScorer } = body;

    if (!champion || !topScorer) {
      return NextResponse.json(
        { error: 'Debes seleccionar campeón y goleador' },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin.from('special_bets').upsert(
      {
        user_id: session.id,
        champion,
        top_scorer: topScorer,
      },
      {
        onConflict: 'user_id',
      },
    );

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
