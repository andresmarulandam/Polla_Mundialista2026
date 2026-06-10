import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { canPredict } from '@/lib/api';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const session = await verifySession(token);

  if (!session) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { matchId, homeScore, awayScore } = body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Check if predictions are still open for this match
    const { data: match } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    if (!canPredict(match)) {
      return NextResponse.json({ error: 'Las predicciones para este partido están cerradas' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('predictions')
      .upsert({
        user_id: session.id,
        match_id: matchId,
        home_score_predicted: homeScore,
        away_score_predicted: awayScore,
      }, {
        onConflict: 'user_id,match_id'
      });

    if (error) {
      console.error('Error creating prediction:', error);
      return NextResponse.json({ error: 'Error al guardar predicción' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Prediction error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}