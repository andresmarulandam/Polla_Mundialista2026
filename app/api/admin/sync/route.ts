import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchMatchesFromAPI, calculatePoints } from '@/lib/api';
import { MatchStage } from '@/lib/types';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const session = await verifySession(token);

  if (!session || !session.is_admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const leagueId = body.leagueId || 4429;
    const season = body.season || '2024-2025';

    console.log(`[Sync] Fetching league ${leagueId}, season ${season}`);
    
    const apiMatches = await fetchMatchesFromAPI(leagueId, season);
    
    console.log(`[Sync] Got ${apiMatches.length} matches from API`);
    
    let matchesUpdated = 0;

    for (const match of apiMatches) {
      if (!match.api_id) continue;

      const { data: existing } = await supabaseAdmin
        .from('matches')
        .select('*')
        .eq('api_id', match.api_id)
        .single();

      if (existing) {
        const updates: any = {
          home_score: match.home_score,
          away_score: match.away_score,
          status: match.status,
          updated_at: new Date().toISOString(),
        };

        await supabaseAdmin
          .from('matches')
          .update(updates)
          .eq('api_id', match.api_id);

        if (match.status === 'finished' && match.home_score != null && match.away_score != null && match.stage) {
          await recalculatePoints(existing.id, match.home_score, match.away_score, match.stage);
          matchesUpdated++;
        }
      } else {
        const { error: insertError } = await supabaseAdmin.from('matches').insert(match);
        if (insertError) {
          console.error('[Sync] Insert error:', insertError);
        } else {
          matchesUpdated++;
        }
      }
    }

    await supabaseAdmin.from('admin_sync_log').insert({
      last_sync_at: new Date().toISOString(),
      matches_updated: matchesUpdated,
    });

    return NextResponse.json({ success: true, matchesUpdated, totalFetched: apiMatches.length });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Error al sincronizar' }, { status: 500 });
  }
}

async function recalculatePoints(
  matchId: string,
  homeScore: number,
  awayScore: number,
  stage: string
) {
  const { data: predictions } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('match_id', matchId);

  if (!predictions) return;

  for (const pred of predictions) {
    const points = calculatePoints(
      pred.home_score_predicted,
      pred.away_score_predicted,
      homeScore,
      awayScore,
      stage as MatchStage
    );

    await supabaseAdmin
      .from('predictions')
      .update({ points_earned: points })
      .eq('id', pred.id);
  }
}