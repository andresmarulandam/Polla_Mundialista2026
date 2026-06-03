'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MatchStage } from '@/lib/types';
import {
  STAGES_ORDER,
  canPredict,
  getTimeRemaining,
  formatMatchDateTime,
  calculatePoints,
  ALL_TEAMS,
  teamsAreReady,
} from '@/lib/api';

const COUNTRY_FLAGS: Record<string, string> = {
  Mexico: '\u{1F1F2}\u{1F1FD}',
  'Estados Unidos': '\u{1F1FA}\u{1F1F8}',
  Canada: '\u{1F1E8}\u{1F1E6}',
};

interface MatchWithPrediction {
  id: string;
  api_id: string | null;
  home_team: string;
  away_team: string;
  match_datetime: string;
  venue: string | null;
  country: string | null;
  stage: string;
  group_name: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  user_prediction: {
    id: string;
    home_score_predicted: number;
    away_score_predicted: number;
    points_earned: number;
  } | null;
}

interface PendingPrediction {
  matchId: string;
  homeScore: number | undefined;
  awayScore: number | undefined;
}

interface HomeClientProps {
  session: { id: string; name: string; is_admin: boolean };
  initialMatches: MatchWithPrediction[];
  initialSpecialBet: {
    champion: string | null;
    top_scorer: string | null;
  } | null;
}

export default function HomeClient({
  session,
  initialMatches,
  initialSpecialBet,
}: HomeClientProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchWithPrediction[]>(initialMatches);
  const [pendingPredictions, setPendingPredictions] = useState<
    Map<string, PendingPrediction>
  >(new Map());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [specialBetChampion, setSpecialBetChampion] = useState(
    initialSpecialBet?.champion || '',
  );
  const [specialBetScorer, setSpecialBetScorer] = useState(
    initialSpecialBet?.top_scorer || '',
  );
  const [savedSpecialBet, setSavedSpecialBet] = useState(initialSpecialBet);

  const tournamentStarted = new Date('2026-06-11T19:00:00Z') <= new Date();

  async function handleSaveSpecialBet() {
    if (!specialBetChampion || !specialBetScorer) {
      setErrorMessage('Debes seleccionar campeon y goleador');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/special-bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          champion: specialBetChampion,
          topScorer: specialBetScorer,
        }),
      });

      if (res.ok) {
        setSuccessMessage('Apuestas especiales guardadas!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setSavedSpecialBet({
          champion: specialBetChampion,
          top_scorer: specialBetScorer,
        });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Error al guardar');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch {
      setErrorMessage('Error al conectar');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  }

  async function handlePredict(matchId: string) {
    const prediction = pendingPredictions.get(matchId);
    if (!prediction) return;

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          homeScore: prediction.homeScore ?? 0,
          awayScore: prediction.awayScore ?? 0,
        }),
      });

      if (res.ok) {
        setSuccessMessage('Prediccion guardada!');
        setTimeout(() => setSuccessMessage(''), 3000);
        router.refresh();
        setPendingPredictions((prev) => {
          const next = new Map(prev);
          next.delete(matchId);
          return next;
        });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Error al guardar');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch {
      setErrorMessage('Error al conectar');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  }

  function handleLogout() {
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    router.push('/login');
  }

  const groupedMatches = STAGES_ORDER.map(({ stage, label }) => ({
    stage,
    label,
    matches: matches.filter((m) => m.stage === stage),
  })).filter((group) => group.matches.length > 0);

  useEffect(() => {
    console.log('CLIENT RENDER matches:', initialMatches.length);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            Polla Mundialista
          </h1>
          <p className="text-text-secondary">Hola, {session.name}!</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/standings')}
            className="btn-secondary"
          >
            Tabla
          </button>
          {session.is_admin && (
            <button
              onClick={() => router.push('/admin')}
              className="btn-primary"
            >
              Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-text-secondary hover:text-white"
          >
            Salir
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="bg-green-900/50 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-center">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-900/50 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-center">
          {errorMessage}
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-bold mb-3 text-secondary">
          Predicciones Especiales (25 pts c/u)
        </h2>
        {savedSpecialBet && !tournamentStarted ? (
          <p className="text-sm text-text-secondary mb-3">
            Ya hiciste tus predicciones especiales. Puedes modificarlas antes de
            que empiece el Mundial.
          </p>
        ) : savedSpecialBet && tournamentStarted ? (
          <p className="text-sm text-text-secondary mb-3">
            Las predicciones estan cerradas. El Mundial ya empezo.
          </p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">
              Campeon
            </label>
            <select
              value={specialBetChampion}
              onChange={(e) => setSpecialBetChampion(e.target.value)}
              disabled={tournamentStarted}
              className="input w-full text-sm"
            >
              <option value="">Seleccionar pais...</option>
              {ALL_TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">
              Goleador
            </label>
            <input
              type="text"
              value={specialBetScorer}
              onChange={(e) => setSpecialBetScorer(e.target.value)}
              disabled={tournamentStarted}
              className="input w-full text-sm"
              placeholder="Nombre del jugador..."
            />
          </div>
        </div>

        {!tournamentStarted && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSaveSpecialBet}
              className="btn-primary text-sm"
            >
              Guardar predicciones especiales
            </button>
          </div>
        )}

        {savedSpecialBet && (
          <div className="mt-3 text-sm text-text-secondary">
            Tu seleccion:{' '}
            <span className="font-bold text-white">
              {savedSpecialBet.champion || '-'} /{' '}
              {savedSpecialBet.top_scorer || '-'}
            </span>
          </div>
        )}
      </div>

      {groupedMatches.map(({ stage, label, matches: stageMatches }) => (
        <div key={stage}>
          <h2 className="text-xl font-bold mb-4 text-secondary">{label}</h2>
          <div className="space-y-3">
            {stageMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onPredict={handlePredict}
                pendingPredictions={pendingPredictions}
                setPendingPredictions={setPendingPredictions}
                setErrorMessage={setErrorMessage}
              />
            ))}
          </div>
        </div>
      ))}

      {groupedMatches.length === 0 && (
        <div className="text-center text-text-secondary py-12">
          <p className="text-xl mb-4">No hay partidos disponibles todavia.</p>
          <p>Pronto se agregaran los partidos del Mundial!</p>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  onPredict,
  pendingPredictions,
  setPendingPredictions,
  setErrorMessage,
}: Readonly<{
  match: MatchWithPrediction;
  onPredict: (matchId: string) => void;
  pendingPredictions: Map<string, PendingPrediction>;
  setPendingPredictions: React.Dispatch<
    React.SetStateAction<Map<string, PendingPrediction>>
  >;
  setErrorMessage: (msg: string) => void;
}>) {
  const router = useRouter();
  const matchOpen = canPredict(match as any);
  const hasExistingPrediction = !!match.user_prediction;
  const [editMode, setEditMode] = useState(false);
  const [editHome, setEditHome] = useState('');
  const [editAway, setEditAway] = useState('');

  const pending = pendingPredictions.get(match.id);
  const isFinished = match.status === 'finished';
  const isKnockoutPlaceholder =
    match.stage !== 'group_stage' &&
    !teamsAreReady(match.home_team, match.away_team);
  const points =
    match.user_prediction &&
    match.home_score != null &&
    match.away_score != null
      ? calculatePoints(
          match.user_prediction.home_score_predicted,
          match.user_prediction.away_score_predicted,
          match.home_score,
          match.away_score,
          match.stage as MatchStage,
        )
      : (match.user_prediction?.points_earned ?? 0);

  function updatePending(home: number | undefined, away: number | undefined) {
    setPendingPredictions((prev) => {
      const next = new Map(prev);
      next.set(match.id, {
        matchId: match.id,
        homeScore: home,
        awayScore: away,
      });
      return next;
    });
  }

  function handleHomeChange(val: string) {
    const cleaned = val.replace(/\D/g, '');
    updatePending(
      cleaned === '' ? undefined : Number(cleaned),
      pending?.awayScore,
    );
  }

  function handleAwayChange(val: string) {
    const cleaned = val.replace(/\D/g, '');
    updatePending(
      pending?.homeScore,
      cleaned === '' ? undefined : Number(cleaned),
    );
  }

  function enterEditMode() {
    setEditHome(match.user_prediction!.home_score_predicted.toString());
    setEditAway(match.user_prediction!.away_score_predicted.toString());
    setEditMode(true);
  }

  async function handleEditSave() {
    const h = editHome === '' ? 0 : Number(editHome);
    const a = editAway === '' ? 0 : Number(editAway);
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match.id, homeScore: h, awayScore: a }),
      });
      if (res.ok) {
        setEditMode(false);
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Error al guardar');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch {
      setErrorMessage('Error al conectar');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  }

  function handleSubmit() {
    const h = pending?.homeScore ?? 0;
    const a = pending?.awayScore ?? 0;
    updatePending(h, a);
    onPredict(match.id);
  }

  const showInput = !isFinished && matchOpen;
  const homeDisplay = editMode
    ? editHome
    : pending?.homeScore != null
      ? String(pending.homeScore)
      : '';
  const awayDisplay = editMode
    ? editAway
    : pending?.awayScore != null
      ? String(pending.awayScore)
      : '';
  const canSubmit =
    pending != null && pending.homeScore != null && pending.awayScore != null;

  return (
    <div
      className={`card ${isFinished && hasExistingPrediction && points > 0 ? 'border-green-500' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-text-secondary">
          {formatMatchDateTime(match.match_datetime)}
          {match.venue && ` - ${match.venue}`}
          {match.country &&
            ` (${COUNTRY_FLAGS[match.country] || ''} ${match.country})`}
        </div>
        <div className="text-sm font-medium text-secondary">
          {isKnockoutPlaceholder
            ? 'Por definir'
            : matchOpen
              ? getTimeRemaining(match as any)
              : 'Cerrado'}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <div
            className={`text-lg font-semibold ${isKnockoutPlaceholder ? 'text-text-secondary italic' : ''}`}
          >
            {isKnockoutPlaceholder ? 'Por definir' : match.home_team}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFinished ? (
            <div className="text-2xl font-bold text-secondary min-w-[3rem] text-center">
              {match.home_score}
            </div>
          ) : (
            <input
              key={`home-${match.id}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={homeDisplay}
              onChange={(e) =>
                editMode
                  ? setEditHome(e.target.value.replace(/\D/g, ''))
                  : handleHomeChange(e.target.value)
              }
              disabled={!showInput && !editMode}
              className="input w-8 text-center text-xl p-0"
              placeholder=""
            />
          )}
          <span className="text-text-secondary">-</span>
          {isFinished ? (
            <div className="text-2xl font-bold text-secondary min-w-[3rem] text-center">
              {match.away_score}
            </div>
          ) : (
            <input
              key={`away-${match.id}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={awayDisplay}
              onChange={(e) =>
                editMode
                  ? setEditAway(e.target.value.replace(/\D/g, ''))
                  : handleAwayChange(e.target.value)
              }
              disabled={!showInput && !editMode}
              className="input w-8 text-center text-xl p-0"
              placeholder=""
            />
          )}
        </div>

        <div className="flex-1">
          <div
            className={`text-lg font-semibold ${isKnockoutPlaceholder ? 'text-text-secondary italic' : ''}`}
          >
            {isKnockoutPlaceholder ? 'Por definir' : match.away_team}
          </div>
        </div>
      </div>

      {showInput && !hasExistingPrediction && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-primary disabled:opacity-50"
          >
            Predecir
          </button>
        </div>
      )}

      {hasExistingPrediction && !isFinished && !editMode && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Tu pronostico:{' '}
            <span className="font-bold text-white">
              {match.user_prediction!.home_score_predicted} -{' '}
              {match.user_prediction!.away_score_predicted}
            </span>
          </div>
          <button
            onClick={enterEditMode}
            className="btn-secondary text-sm py-1 px-3"
          >
            Editar
          </button>
        </div>
      )}

      {hasExistingPrediction && !isFinished && editMode && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={handleEditSave}
            className="btn-primary text-sm py-1 px-3"
          >
            Guardar
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="btn-secondary text-sm py-1 px-3"
          >
            Cancelar
          </button>
        </div>
      )}

      {hasExistingPrediction && isFinished && (
        <div className="mt-3 text-sm text-text-secondary">
          Tu pronostico:{' '}
          <span className="font-bold text-white">
            {match.user_prediction!.home_score_predicted} -{' '}
            {match.user_prediction!.away_score_predicted}
          </span>
        </div>
      )}

      {hasExistingPrediction &&
        isFinished &&
        (() => {
          const predictedHome = match.user_prediction!.home_score_predicted;
          const predictedAway = match.user_prediction!.away_score_predicted;
          const isExact =
            predictedHome === match.home_score &&
            predictedAway === match.away_score;
          return (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-text-secondary">Puntos:</span>
              <span
                className={`font-bold ${points > 0 ? 'text-green-400' : 'text-text-secondary'}`}
              >
                {points}
              </span>
              {isExact && (
                <span className="text-green-400">Resultado exacto!</span>
              )}
              {!isExact && points > 0 && (
                <span className="text-yellow-400">Ganador/empate correcto</span>
              )}
            </div>
          );
        })()}

      {match.group_name && (
        <div className="mt-2 text-xs text-text-secondary">
          {match.group_name}
        </div>
      )}
    </div>
  );
}
