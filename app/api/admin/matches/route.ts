import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const session = await verifySession(token);
  if (!session || !session.is_admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { data: matches, error } = await supabaseAdmin
    .from('matches')
    .select('*')
    .order('match_datetime', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ matches: matches || [] });
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const session = await verifySession(token);
  if (!session || !session.is_admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const body = await request.json();
    const { matchId, homeTeam, awayTeam, homeScore, awayScore, status } = body;

    if (!matchId) return NextResponse.json({ error: 'Falta matchId' }, { status: 400 });

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (homeTeam !== undefined) updates.home_team = homeTeam;
    if (awayTeam !== undefined) updates.away_team = awayTeam;
    if (homeScore !== undefined) updates.home_score = homeScore;
    if (awayScore !== undefined) updates.away_score = awayScore;

    // Si ambos scores estan presentes, marcar como finalizado
    if (updates.home_score !== undefined && updates.away_score !== undefined) {
      updates.status = 'finished';
    } else if (status !== undefined) {
      updates.status = status;
    }

    const { error } = await supabaseAdmin
      .from('matches')
      .update(updates)
      .eq('id', matchId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
