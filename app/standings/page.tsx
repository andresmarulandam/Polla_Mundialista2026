'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/lib/types';

interface Standing {
  rank: number;
  user_id: string;
  user_name: string;
  total_points: number;
  exact_predictions: number;
}

export default function StandingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

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
      loadStandings();
    } catch {
      router.push('/login');
    }
  }

  async function loadStandings() {
    try {
      const res = await fetch('/api/standings');
      const data = await res.json();
      setStandings(data.standings || []);
    } catch (err) {
      console.error('Error loading standings:', err);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-secondary">🏆 Tabla de Posiciones</h1>
        <button onClick={handleGoBack} className="btn-secondary">
          Volver
        </button>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-background">
            <tr className="text-text-secondary text-sm">
              <th className="px-4 py-3 text-center">#</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-center">Puntos</th>
              <th className="px-4 py-3 text-center">Marcadores exactos acertados</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((entry, index) => (
              <tr
                key={entry.user_id}
                className={`border-t border-gray-800 ${
                  index === 0 ? 'bg-yellow-900/20' : ''
                }`}
              >
                <td className="px-4 py-3 text-center font-bold">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : entry.rank}
                </td>
                <td className="px-4 py-3 font-medium">{entry.user_name}</td>
                <td className="px-4 py-3 text-center text-secondary font-bold">
                  {entry.total_points}
                </td>
                <td className="px-4 py-3 text-center text-text-secondary">
                  {entry.exact_predictions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {standings.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            No hay predicciones todavía.
          </div>
        )}
      </div>
    </div>
  );
}