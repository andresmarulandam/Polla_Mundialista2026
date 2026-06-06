'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/lib/types';
import { STAGES_ORDER } from '@/lib/api';

interface AdminUser {
  id: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

interface Match {
  id: string;
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
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editHome, setEditHome] = useState('');
  const [editAway, setEditAway] = useState('');
  const [editHomeTeam, setEditHomeTeam] = useState('');
  const [editAwayTeam, setEditAwayTeam] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'users' | 'special'>(
    'matches',
  );
  const [champion, setChampion] = useState('');
  const [topScorer, setTopScorer] = useState('');
  const [specialBets, setSpecialBets] = useState<
    Array<{
      user_id: string;
      champion: string | null;
      top_scorer: string | null;
      user_name?: string;
      is_champion_correct?: boolean;
      is_scorer_correct?: boolean;
    }>
  >([]);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (!res.ok || !data?.session?.is_admin) {
        router.push('/');
        return;
      }
      setSession(data.session);
      loadData();
    } catch {
      router.push('/');
    }
  }

  async function loadData() {
    try {
      const [usersRes, matchesRes, betsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/matches'),
        fetch('/api/admin/special-bets'),
      ]);
      const usersData = await usersRes.json();
      const matchesData = await matchesRes.json();
      setUsers(usersData.users || []);
      setMatches(matchesData.matches || []);

      const betsData = await betsRes.json();
      setSpecialBets(betsData.bets || []);
      if (betsData.actualChampion) setChampion(betsData.actualChampion);
      if (betsData.actualTopScorer) setTopScorer(betsData.actualTopScorer);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(match: Match) {
    setEditingMatch(match.id);
    setEditHome(match.home_score?.toString() ?? '');
    setEditAway(match.away_score?.toString() ?? '');
    setEditHomeTeam(match.home_team);
    setEditAwayTeam(match.away_team);
  }

  async function saveMatch(matchId: string) {
    try {
      const body: Record<string, unknown> = { matchId };
      if (editHomeTeam) body.homeTeam = editHomeTeam;
      if (editAwayTeam) body.awayTeam = editAwayTeam;
      if (editHome !== '') body.homeScore = Number.parseInt(editHome) || 0;
      if (editAway !== '') body.awayScore = Number.parseInt(editAway) || 0;
      if (editHome !== '' && editAway !== '') body.status = 'finished';

      const res = await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage('Partido actualizado');
        setTimeout(() => setMessage(''), 2000);
        setEditingMatch(null);
        loadData();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Error al guardar');
      }
    } catch {
      setMessage('Error al conectar');
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Eliminar este usuario y todas sus predicciones?')) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
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
    matches: matches.filter((m) => m.stage === stage),
  })).filter((group) => group.matches.length > 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary">Panel de Admin</h1>
        <button onClick={() => router.push('/')} className="btn-secondary">
          Volver
        </button>
      </header>

      {message && (
        <div className="bg-green-900/50 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-center">
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('matches')}
          className={activeTab === 'matches' ? 'btn-primary' : 'btn-secondary'}
        >
          Partidos ({matches.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
        >
          Usuarios ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('special')}
          className={activeTab === 'special' ? 'btn-primary' : 'btn-secondary'}
        >
          Predicciones especiales
        </button>
      </div>

      {activeTab === 'matches' && (
        <div className="space-y-6">
          {groupedMatches.map(({ stage, label, matches: stageMatches }) => (
            <div key={stage} className="card">
              <h2 className="text-lg font-bold mb-4 text-secondary">
                {label} ({stageMatches.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-secondary border-b border-gray-700">
                      <th className="px-2 py-2 text-left">Fecha</th>
                      <th className="px-2 py-2 text-left">Grupo</th>
                      <th className="px-2 py-2 text-left">Estadio</th>
                      <th className="px-2 py-2 text-center">Local</th>
                      <th className="px-2 py-2 text-center">Marcador</th>
                      <th className="px-2 py-2 text-center">Visitante</th>
                      <th className="px-2 py-2 text-center">Estado</th>
                      <th className="px-2 py-2 text-center">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stageMatches.map((match) => (
                      <tr
                        key={match.id}
                        className={`border-b border-gray-800 ${match.status === 'finished' ? 'bg-green-900/10' : ''}`}
                      >
                        <td className="px-2 py-2 whitespace-nowrap">
                          {new Date(match.match_datetime).toLocaleDateString(
                            'es-CO',
                            { month: 'short', day: 'numeric' },
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs">
                          {match.group_name || '-'}
                        </td>
                        <td className="px-2 py-2 text-xs">{match.venue}</td>
                        <td className="px-2 py-2 font-medium text-right">
                          {editingMatch === match.id ? (
                            <input
                              value={editHomeTeam}
                              onChange={(e) => setEditHomeTeam(e.target.value)}
                              className="w-24 text-right text-sm bg-gray-800 border border-gray-500 rounded px-2 py-1 text-white focus:border-primary focus:outline-none"
                              placeholder="Equipo"
                            />
                          ) : (
                            <span
                              className={
                                match.country
                                  ? ''
                                  : 'text-text-secondary italic'
                              }
                            >
                              {match.home_team}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center font-bold">
                          {editingMatch === match.id ? (
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                value={editHome}
                                onChange={(e) =>
                                  setEditHome(
                                    e.target.value
                                      .replace(/\D/g, '')
                                      .slice(0, 2),
                                  )
                                }
                                className="w-10 text-center text-sm bg-gray-800 border border-gray-500 rounded px-1 py-1 text-white focus:border-primary focus:outline-none"
                                maxLength={2}
                                placeholder="-"
                              />
                              <span className="text-text-secondary">-</span>
                              <input
                                value={editAway}
                                onChange={(e) =>
                                  setEditAway(
                                    e.target.value
                                      .replace(/\D/g, '')
                                      .slice(0, 2),
                                  )
                                }
                                className="w-10 text-center text-sm bg-gray-800 border border-gray-500 rounded px-1 py-1 text-white focus:border-primary focus:outline-none"
                                maxLength={2}
                                placeholder="-"
                              />
                            </div>
                          ) : (
                            <span>
                              {match.home_score == null
                                ? '-'
                                : `${match.home_score} - ${match.away_score}`}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 font-medium text-left">
                          {editingMatch === match.id ? (
                            <input
                              value={editAwayTeam}
                              onChange={(e) => setEditAwayTeam(e.target.value)}
                              className="w-24 text-sm bg-gray-800 border border-gray-500 rounded px-2 py-1 text-white focus:border-primary focus:outline-none"
                              placeholder="Equipo"
                            />
                          ) : (
                            <span
                              className={
                                match.country
                                  ? ''
                                  : 'text-text-secondary italic'
                              }
                            >
                              {match.away_team}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded ${match.status === 'finished' ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-text-secondary'}`}
                          >
                            {match.status === 'finished'
                              ? 'Finalizado'
                              : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          {editingMatch === match.id ? (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => saveMatch(match.id)}
                                className="btn-primary text-xs py-1 px-2"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingMatch(null)}
                                className="btn-secondary text-xs py-1 px-2"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(match)}
                              className="btn-secondary text-xs py-1 px-2"
                            >
                              Editar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Usuarios ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr className="text-text-secondary text-sm">
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-center">Admin</th>
                  <th className="px-4 py-2 text-left">Creado</th>
                  <th className="px-4 py-2 text-center">Accion</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-center">
                      {user.is_admin ? 'Si' : 'No'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">
                      {new Date(user.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-accent hover:underline text-sm"
                        disabled={user.is_admin}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'special' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Resultados Reales</h2>
            <p className="text-sm text-text-secondary mb-4">
              Coloca el campeón y goleador reales. Cada usuario que acierte
              recibirá 25 puntos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="champion-input"
                  className="block text-sm font-medium mb-1"
                >
                  Campeón real
                </label>
                <input
                  id="champion-input"
                  type="text"
                  value={champion}
                  onChange={(e) => setChampion(e.target.value)}
                  className="input w-full text-sm"
                  placeholder="País campeón..."
                />
              </div>
              <div>
                <label
                  htmlFor="top-scorer-input"
                  className="block text-sm font-medium mb-1"
                >
                  Goleador real
                </label>
                <input
                  id="top-scorer-input"
                  type="text"
                  value={topScorer}
                  onChange={(e) => setTopScorer(e.target.value)}
                  className="input w-full text-sm"
                  placeholder="Nombre del goleador..."
                />
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/tournament-settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ champion, topScorer: topScorer }),
                  });
                  if (res.ok) {
                    setMessage('Resultados especiales guardados');
                    setTimeout(() => setMessage(''), 2000);
                    loadData();
                  }
                } catch {
                  setMessage('Error al guardar');
                }
              }}
              className="btn-primary"
            >
              Guardar resultados reales
            </button>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">
              Predicciones de Usuarios ({specialBets.length})
            </h2>
            {specialBets.length === 0 ? (
              <p className="text-text-secondary">
                Ningun usuario ha hecho predicciones especiales aun.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-secondary border-b border-gray-700">
                      <th className="px-3 py-2 text-left">Usuario</th>
                      <th className="px-3 py-2 text-left">Campeón</th>
                      <th className="px-3 py-2 text-left">Goleador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialBets.map((bet) => (
                      <tr
                        key={bet.user_id}
                        className="border-b border-gray-800"
                      >
                        <td className="px-3 py-2 font-medium">
                          {bet.user_name}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              bet.is_champion_correct
                                ? 'text-green-400 font-bold'
                                : ''
                            }
                          >
                            {bet.champion || '-'}
                          </span>
                          {bet.is_champion_correct && ' ✓'}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              bet.is_scorer_correct
                                ? 'text-green-400 font-bold'
                                : ''
                            }
                          >
                            {bet.top_scorer || '-'}
                          </span>
                          {bet.is_scorer_correct && ' ✓'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
