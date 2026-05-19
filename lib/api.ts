import { Match, MatchStage, MatchStatus } from './types';

const SPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';

export const STAGE_LABELS: Record<MatchStage, string> = {
  group_stage: 'Fase de Grupos',
  round_of_32: 'Octavos de Final',
  round_of_16: 'Cuartos de Final',
  quarter_final: 'Semifinales',
  semi_final: 'Final',
  third_place: 'Partido por el 3er Lugar',
  final: 'Gran Final',
};

export const STAGES_ORDER: { stage: MatchStage; label: string }[] = [
  { stage: 'group_stage', label: 'Fase de Grupos' },
  { stage: 'round_of_32', label: 'Octavos de Final' },
  { stage: 'round_of_16', label: 'Cuartos de Final' },
  { stage: 'quarter_final', label: 'Semifinales' },
  { stage: 'semi_final', label: 'Final' },
  { stage: 'third_place', label: 'Partido por el 3er Lugar' },
  { stage: 'final', label: 'Gran Final' },
];

export async function fetchMatchesFromAPI(leagueId: number = 4429, season: string = '2026'): Promise<Partial<Match>[]> {
  try {
    console.log(`[API] Fetching from: ${SPORTSDB_BASE_URL}/eventsseason.php?id=${leagueId}&s=${season}`);
    
    const response = await fetch(
      `${SPORTSDB_BASE_URL}/eventsseason.php?id=${leagueId}&s=${season}`
    );

    console.log(`[API] Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const text = await response.text();
    console.log(`[API] Response preview: ${text.substring(0, 200)}`);
    
    try {
      const data = JSON.parse(text);
      
      if (!data.events) {
        console.log('[API] No events in response, data keys:', Object.keys(data));
        return [];
      }

      console.log(`[API] Found ${data.events.length} events`);
      return data.events.map((event: any) => mapEventToMatch(event));
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    return [];
  }
}

function mapEventToMatch(event: any): Partial<Match> {
  const stage = mapStage(event.strGroup, event.strRound);
  
  let matchDatetime: string;
  if (event.dateEvent && event.strTime) {
    const timeMatch = event.strTime.match(/^(\d{2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      matchDatetime = `${event.dateEvent}T${timeMatch[1]}:${timeMatch[2]}:00Z`;
    } else {
      matchDatetime = `${event.dateEvent}T12:00:00Z`;
    }
  } else if (event.dateEvent) {
    matchDatetime = `${event.dateEvent}T12:00:00Z`;
  } else {
    matchDatetime = new Date().toISOString();
  }

  return {
    api_id: event.idEvent,
    home_team: event.strHomeTeam,
    away_team: event.strAwayTeam,
    match_datetime: matchDatetime,
    venue: event.strVenue,
    stage,
    group_name: event.strGroup || null,
    home_score: event.intHomeScore ? parseInt(event.intHomeScore) : null,
    away_score: event.intAwayScore ? parseInt(event.intAwayScore) : null,
    status: mapStatus(event.strStatus),
  };
}

function mapStage(group: string | null, round: string | null): MatchStage {
  if (!round) return 'group_stage';
  
  const roundLower = round.toLowerCase();
  
  if (roundLower.includes('third') || roundLower.includes('3rd')) {
    return 'third_place';
  }
  if (roundLower.includes('final') && !roundLower.includes('third')) {
    return 'final';
  }
  if (roundLower.includes('semi')) {
    return 'semi_final';
  }
  if (roundLower.includes('quart') || roundLower.includes('quarter')) {
    return 'quarter_final';
  }
  if (roundLower.includes('octa') || roundLower.includes('round of 16') || roundLower.includes('16th')) {
    return 'round_of_16';
  }
  if (roundLower.includes('round of 32') || roundLower.includes('32nd')) {
    return 'round_of_32';
  }
  
  return 'group_stage';
}

function mapStatus(status: string | null): MatchStatus {
  if (!status) return 'pending';
  
  const statusLower = status.toLowerCase();
  if (statusLower === 'finished' || statusLower === 'ft' || statusLower === 'final' || statusLower === 'ap') {
    return 'finished';
  }
  return 'pending';
}

export function calculatePoints(
  homePredicted: number,
  awayPredicted: number,
  homeActual: number,
  awayActual: number,
  stage: MatchStage
): number {
  const isKnockout = stage !== 'group_stage';
  const multiplier = isKnockout ? 2 : 1;

  if (homePredicted === homeActual && awayPredicted === awayActual) {
    return 5 * multiplier;
  }

  const homeWin = homeActual > awayActual;
  const awayWin = awayActual > homeActual;
  const draw = homeActual === awayActual;

  const predictedHomeWin = homePredicted > awayPredicted;
  const predictedAwayWin = awayPredicted > homePredicted;
  const predictedDraw = homePredicted === awayPredicted;

  if (
    (homeWin && predictedHomeWin) ||
    (awayWin && predictedAwayWin) ||
    (draw && predictedDraw)
  ) {
    return 3 * multiplier;
  }

  return 0;
}

export function canPredict(match: { status: string; home_score: number | null; away_score: number | null; match_datetime: string; stage: MatchStage }): boolean {
  if (match.status === 'finished') return false;
  if (match.home_score !== null || match.away_score !== null) return false;
  
  const now = new Date();
  const matchTime = new Date(match.match_datetime);
  const hoursDiff = (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  const deadlineHours = match.stage === 'group_stage' ? 48 : 48;
  
  return hoursDiff > deadlineHours;
}

export function getTimeRemaining(match: { match_datetime: string }): string {
  const now = new Date();
  const matchTime = new Date(match.match_datetime);
  const diff = matchTime.getTime() - now.getTime();

  if (diff <= 0) return 'Cerrado';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return `Cierra en ${days}d ${remainingHours}h`;
  }
  if (hours > 0) {
    return `Cierra en ${hours}h`;
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  return `Cierra en ${minutes}m`;
}

export function formatMatchDateTime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleString('es-MX', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
  });
}