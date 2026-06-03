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

  if (!session?.is_admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await getRequestBody(request);
    const leagueId = typeof body.leagueId === 'number' ? body.leagueId : 4429;
    const season = typeof body.season === 'string' ? body.season : '2024-2025';

    console.log(`[Sync] Fetching league ${leagueId}, season ${season}`);

    const apiMatches = await fetchMatchesFromAPI(leagueId, season);

    console.log(`[Sync] Got ${apiMatches.length} matches from API`);

    const matchesUpdated = await syncMatches(apiMatches);

    await supabaseAdmin.from('admin_sync_log').insert({
      last_sync_at: new Date().toISOString(),
      matches_updated: matchesUpdated,
    });

    return NextResponse.json({
      success: true,
      matchesUpdated,
      totalFetched: apiMatches.length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Error al sincronizar' },
      { status: 500 },
    );
  }
}

async function getRequestBody(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function syncMatches(apiMatches: Array<any>) {
  let matchesUpdated = 0;

  for (const match of apiMatches) {
    if (!match?.api_id) continue;

    const wasUpdated = await processMatch(match);
    if (wasUpdated) matchesUpdated++;
  }

  return matchesUpdated;
}

async function processMatch(match: any) {
  const { data: existing } = await supabaseAdmin
    .from('matches')
    .select('*')
    .eq('api_id', match.api_id)
    .single();

  if (existing) {
    await updateExistingMatch(existing.id, match);
    return shouldRecalculate(match);
  }

  return await insertMatch(match);
}

async function updateExistingMatch(matchId: string, match: any) {
  const updates = {
    home_score: match.home_score,
    away_score: match.away_score,
    status: match.status,
    updated_at: new Date().toISOString(),
  };

  await supabaseAdmin
    .from('matches')
    .update(updates)
    .eq('api_id', match.api_id);

  if (shouldRecalculate(match)) {
    await recalculatePoints(
      matchId,
      match.home_score,
      match.away_score,
      match.stage,
    );
  }
}

function shouldRecalculate(match: any) {
  return (
    match.status === 'finished' &&
    match.home_score != null &&
    match.away_score != null &&
    Boolean(match.stage)
  );
}

async function insertMatch(match: any) {
  const { error } = await supabaseAdmin.from('matches').insert(match);
  if (error) {
    console.error('[Sync] Insert error:', error);
    return false;
  }
  return true;
}

async function recalculatePoints(
  matchId: string,
  homeScore: number,
  awayScore: number,
  stage: string,
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
      stage as MatchStage,
    );

    await supabaseAdmin
      .from('predictions')
      .update({ points_earned: points })
      .eq('id', pred.id);
  }
}
