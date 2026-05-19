'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/lib/types';

interface AdminUser {
  id: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

const POPULAR_LEAGUES = [
  { id: 4429, name: '🏆 Mundial FIFA 2026', season: '2026' },
  { id: 4328, name: 'Premier League (Inglaterra)', season: '2024-2025' },
  { id: 4330, name: 'La Liga (España)', season: '2024-2025' },
  { id: 4331, name: 'Bundesliga (Alemania)', season: '2024-2025' },
  { id: 4332, name: 'Serie A (Italia)', season: '2024-2025' },
  { id: 4334, name: 'Ligue 1 (Francia)', season: '2024-2025' },
  { id: 4480, name: 'Copa Libertadores', season: '2025' },
  { id: 4500, name: 'Champions League', season: '2024-2025' },
];

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedLeague, setSelectedLeague] = useState(4429);
  const [lastSyncInfo, setLastSyncInfo] = useState<{last_sync_at: string; matches_updated: number} | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      
      if (!res.ok || !data.session || !data.session.is_admin) {
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
      const [usersRes, syncRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/sync-info'),
      ]);
      
      const usersData = await usersRes.json();
      const syncData = await syncRes.json();
      
      setUsers(usersData.users || []);
      setLastSyncInfo(syncData.syncLog || null);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setMessage('');

    const league = POPULAR_LEAGUES.find(l => l.id === selectedLeague);

    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: selectedLeague,
          season: league?.season || '2024-2025'
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`Sincronizados ${data.matchesUpdated} de ${data.totalFetched} partidos de ${league?.name}`);
        loadData();
      } else {
        setMessage(data.error || 'Error al sincronizar');
      }
    } catch {
      setMessage('Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('¿Eliminar este usuario y todas sus predicciones?')) return;

    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  }

  function handleGoBack() {
    router.push('/');
  }

  if (!session || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-secondary text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary">⚙️ Panel de Admin</h1>
        <button onClick={handleGoBack} className="btn-secondary">
          Volver
        </button>
      </header>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Sincronizar API</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Seleccionar Liga</label>
          <select
            value={selectedLeague}
            onChange={e => setSelectedLeague(Number(e.target.value))}
            className="input w-full"
          >
            {POPULAR_LEAGUES.map(league => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-primary disabled:opacity-50"
          >
            {syncing ? 'Sincronizando...' : 'Sync API'}
          </button>
          
          {lastSyncInfo && (
            <span className="text-text-secondary text-sm">
              Última sync: {new Date(lastSyncInfo.last_sync_at).toLocaleString('es-MX')} ({lastSyncInfo.matches_updated} partidos)
            </span>
          )}
        </div>
        
        {message && <p className="mt-3 text-green-400">{message}</p>}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Usuarios ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr className="text-text-secondary text-sm">
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-center">Admin</th>
                <th className="px-4 py-2 text-left">Creado</th>
                <th className="px-4 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-gray-800">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-center">
                    {user.is_admin ? '✓' : '-'}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {new Date(user.created_at).toLocaleDateString('es-MX')}
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
    </div>
  );
}