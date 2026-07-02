import { Match, MatchStage, MatchStatus } from './types';

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const SPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';

export const ALL_TEAMS = [
  'Alemania',
  'Argelia',
  'Arabia Saudita',
  'Argentina',
  'Australia',
  'Austria',
  'Bélgica',
  'Bosnia y Herzegovina',
  'Brasil',
  'Cabo Verde',
  'Canadá',
  'Colombia',
  'Costa de Marfil',
  'Croacia',
  'Curazao',
  'Corea del Sur',
  'Ecuador',
  'Egipto',
  'Escocia',
  'España',
  'Estados Unidos',
  'Francia',
  'Ghana',
  'Haití',
  'Inglaterra',
  'Irán',
  'Irak',
  'Japón',
  'Jordania',
  'Marruecos',
  'México',
  'Nueva Zelanda',
  'Noruega',
  'Paises Bajos',
  'Panamá',
  'Paraguay',
  'Portugal',
  'Qatar',
  'RD Congo',
  'República Checa',
  'Senegal',
  'Sudáfrica',
  'Suecia',
  'Suiza',
  'Túnez',
  'Turquia',
  'Uruguay',
  'Uzbekistán',
];

export const STAGE_LABELS: Record<MatchStage, string> = {
  group_stage: 'Fase de Grupos',
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos de Final',
  quarter_final: 'Cuartos de Final',
  semi_final: 'Semifinales',
  third_place: 'Partido por el 3er Lugar',
  final: 'Gran Final',
};

export const STAGES_ORDER: { stage: MatchStage; label: string }[] = [
  { stage: 'group_stage', label: 'Fase de Grupos' },
  { stage: 'round_of_32', label: 'Ronda de 32' },
  { stage: 'round_of_16', label: 'Octavos de Final' },
  { stage: 'quarter_final', label: 'Cuartos de Final' },
  { stage: 'semi_final', label: 'Semifinales' },
  { stage: 'third_place', label: 'Partido por el 3er Lugar' },
  { stage: 'final', label: 'Gran Final' },
];

export async function fetchMatchesFromAPI(
  leagueId: number = 4429,
  season: string = '2026',
): Promise<Partial<Match>[]> {
  try {
    console.log(
      `[API] Fetching from: ${SPORTSDB_BASE_URL}/eventsseason.php?id=${leagueId}&s=${season}`,
    );

    const response = await fetch(
      `${SPORTSDB_BASE_URL}/eventsseason.php?id=${leagueId}&s=${season}`,
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
        console.log(
          '[API] No events in response, data keys:',
          Object.keys(data),
        );
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
    home_score: event.intHomeScore ? Number.parseInt(event.intHomeScore) : null,
    away_score: event.intAwayScore ? Number.parseInt(event.intAwayScore) : null,
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
  if (
    roundLower.includes('octa') ||
    roundLower.includes('round of 16') ||
    roundLower.includes('16th')
  ) {
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
  if (
    statusLower === 'finished' ||
    statusLower === 'ft' ||
    statusLower === 'final' ||
    statusLower === 'ap'
  ) {
    return 'finished';
  }
  return 'pending';
}

export function calculatePoints(
  homePredicted: number,
  awayPredicted: number,
  homeActual: number,
  awayActual: number,
  stage: MatchStage,
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

export const GROUP_STAGE_DEADLINE = new Date('2026-06-10T04:59:00Z'); // Jun 9 23:59 Colombia
export const ROUND_OF_32_DEADLINE = new Date('2026-06-28T18:50:00Z'); // Jun 28 13:50 Colombia
export const ROUND_OF_16_DEADLINE = new Date('2026-07-04T16:00:00Z'); // Jul 4 11:00 Colombia

const REAL_TEAMS = new Set(ALL_TEAMS);
const NORMALIZED_TEAMS = new Set(ALL_TEAMS.map(normalize));

export function teamsAreReady(homeTeam: string, awayTeam: string): boolean {
  if (!homeTeam || !awayTeam) return false;
  return (
    NORMALIZED_TEAMS.has(normalize(homeTeam)) &&
    NORMALIZED_TEAMS.has(normalize(awayTeam))
  );
}

export function canPredict(match: {
  status: string;
  home_score: number | null;
  away_score: number | null;
  match_datetime: string;
  stage: MatchStage;
  home_team: string;
  away_team: string;
}): boolean {
  if (match.status === 'finished') return false;
  if (match.home_score !== null || match.away_score !== null) return false;

  // Knockout: no predecir si los equipos aun no se conocen
  if (
    match.stage !== 'group_stage' &&
    !teamsAreReady(match.home_team, match.away_team)
  ) {
    return false;
  }

  const now = new Date();

  // Fase de grupos: plazo maximo hasta el 9 de junio
  if (match.stage === 'group_stage') {
    return now < GROUP_STAGE_DEADLINE;
  }

  // Ronda de 32: plazo fijo hasta el 28 de junio 1pm Colombia
  if (match.stage === 'round_of_32') {
    return now < ROUND_OF_32_DEADLINE;
  }

  // Octavos de final: plazo fijo hasta el 4 de julio 11am Colombia
  if (match.stage === 'round_of_16') {
    return now < ROUND_OF_16_DEADLINE;
  }

  // Demas etapas knockout: 48 horas antes del partido
  const matchTime = new Date(match.match_datetime);
  const hoursDiff = (matchTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 48;
}

export function getTimeRemaining(match: {
  match_datetime: string;
  stage?: string;
}): string {
  const now = new Date();

  // Fase de grupos: mostrar tiempo hasta el 9 de junio
  // Ronda de 32: mostrar tiempo hasta el 28 de junio 1pm
  // Octavos de final: mostrar tiempo hasta el 4 de julio 11am
  let deadline: Date;
  if (match.stage === 'group_stage') {
    deadline = GROUP_STAGE_DEADLINE;
  } else if (match.stage === 'round_of_32') {
    deadline = ROUND_OF_32_DEADLINE;
  } else if (match.stage === 'round_of_16') {
    deadline = ROUND_OF_16_DEADLINE;
  } else {
    deadline = new Date(match.match_datetime);
  }

  const diff = deadline.getTime() - now.getTime();

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
  return date.toLocaleString('es-CO', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  });
}
