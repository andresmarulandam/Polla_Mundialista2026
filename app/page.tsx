'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/lib/types';
import { STAGES_ORDER, canPredict, getTimeRemaining, formatMatchDateTime } from '@/lib/api';

interface MatchWithPrediction {
  id: string;
  api_id: string | null;
  home_team: string;
  away_team: string;
  match_datetime: string;
  venue: string | null;
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
  homeScore: number;
  awayScore: number;
}

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [matches, setMatches] = useState<MatchWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingPredictions, setPendingPredictions] = useState<Map<string, PendingPrediction>>(new Map());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      
      if (!res.ok || !data.session) {
        router.push('/login');
        return;
      }
      
      setSession(data.session);
      loadMatches();
    } catch {
      router.push('/login');
    }
  }

  async function loadMatches() {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePredict(matchId: string) {
    const prediction = pendingPredictions.get(matchId);
    if (!prediction || !session) return;

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore,
        }),
      });

      if (res.ok) {
        setSuccessMessage('¡Predicción guardada!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadMatches();
        setPendingPredictions(prev => {
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

  function handleNavigateStandings() {
    router.push('/standings');
  }

  function handleNavigateAdmin() {
    if (session?.is_admin) {
      router.push('/admin');
    }
  }

  if (!session || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-secondary text-xl">Cargando...</div>
      </div>
    );
  }

  const groupedMatches = STAGES_ORDER.map(({ stage, label }) => ({
    stage,
    label,
    matches: matches.filter(m => m.stage === stage),
  })).filter(group => group.matches.length > 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">🏆 Polla Mundialista</h1>
          <p className="text-text-secondary">Hola, {session.name}!</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleNavigateStandings} className="btn-secondary">
            Tabla
          </button>
          {session.is_admin && (
            <button onClick={handleNavigateAdmin} className="btn-primary">
              Admin
            </button>
          )}
          <button onClick={handleLogout} className="text-text-secondary hover:text-white">
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

      {groupedMatches.map(({ stage, label, matches }) => (
        <div key={stage}>
          <h2 className="text-xl font-bold mb-4 text-secondary">{label}</h2>
          <div className="space-y-3">
            {matches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onPendingChange={(home, away) => {
                  setPendingPredictions(prev => {
                    const next = new Map(prev);
                    next.set(match.id, { matchId: match.id, homeScore: home, awayScore: away });
                    return next;
                  });
                }}
                onPredict={() => handlePredict(match.id)}
                pendingPrediction={pendingPredictions.get(match.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {groupedMatches.length === 0 && (
        <div className="text-center text-text-secondary py-12">
          <p className="text-xl mb-4">No hay partidos disponibles todavía.</p>
          <p>¡Pronto se agregarán los partidos del Mundial!</p>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  onPendingChange,
  onPredict,
  pendingPrediction,
}: {
  match: MatchWithPrediction;
  onPendingChange: (home: number, away: number) => void;
  onPredict: () => void;
  pendingPrediction?: PendingPrediction;
}) {
  const matchOpen = canPredict(match as any);
  const hasExistingPrediction = !!match.user_prediction;
  const canSubmit = pendingPrediction && !hasExistingPrediction;

  const homeScore = pendingPrediction?.homeScore ?? match.user_prediction?.home_score_predicted ?? 0;
  const awayScore = pendingPrediction?.awayScore ?? match.user_prediction?.away_score_predicted ?? 0;

  const points = match.user_prediction?.points_earned;
  const isFinished = match.status === 'finished';

  return (
    <div className={`card ${isFinished && points != null && points > 0 ? 'border-green-500' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-text-secondary">
          {formatMatchDateTime(match.match_datetime)}
          {match.venue && ` • ${match.venue}`}
        </div>
        <div className="text-sm font-medium text-secondary">
          {matchOpen ? getTimeRemaining(match as any) : 'Cerrado'}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <div className="text-lg font-semibold">{match.home_team}</div>
        </div>

        <div className="flex items-center gap-2">
          {isFinished ? (
            <div className="text-2xl font-bold text-secondary min-w-[3rem] text-center">
              {match.home_score}
            </div>
          ) : (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={homeScore || ''}
              onChange={e => onPendingChange(Number(e.target.value.replace(/\D/g,'').slice(-1)), awayScore)}
              disabled={!matchOpen && !hasExistingPrediction}
              className="input w-8 text-center text-xl p-0"
              placeholder="-"
            />
          )}
          <span className="text-text-secondary">-</span>
          {isFinished ? (
            <div className="text-2xl font-bold text-secondary min-w-[3rem] text-center">
              {match.away_score}
            </div>
          ) : (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={awayScore || ''}
              onChange={e => onPendingChange(homeScore, Number(e.target.value.replace(/\D/g,'').slice(-1)))}
              disabled={!matchOpen && !hasExistingPrediction}
              className="input w-8 text-center text-xl p-0"
              placeholder="-"
            />
          )}
        </div>

        <div className="flex-1">
          <div className="text-lg font-semibold">{match.away_team}</div>
        </div>
      </div>

      {matchOpen && !hasExistingPrediction && (
        <div className="mt-4 flex justify-end">
          <button onClick={onPredict} disabled={!canSubmit} className="btn-primary disabled:opacity-50">
            Predecir
          </button>
        </div>
      )}

      {hasExistingPrediction && !isFinished && (
        <div className="mt-3 text-sm text-text-secondary">
          Tu pronostico: {match.user_prediction!.home_score_predicted} - {match.user_prediction!.away_score_predicted}
        </div>
      )}

      {points != null && isFinished && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-text-secondary">Puntos:</span>
          <span className={`font-bold ${points > 0 ? 'text-green-400' : 'text-text-secondary'}`}>
            {points}
          </span>
          {points >= 5 && <span className="text-green-400">✓ Score exacto!</span>}
          {points >= 3 && points < 5 && <span className="text-yellow-400">✓ Ganador/draw correcto</span>}
        </div>
      )}

      {match.group_name && (
        <div className="mt-2 text-xs text-text-secondary">{match.group_name}</div>
      )}
    </div>
  );
}