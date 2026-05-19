'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, action: isRegister ? 'register' : 'login' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error desconocido');
        return;
      }

      router.push('/');
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-secondary">
          🏆 Polla Mundialista
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Tu nombre"
              required
              minLength={2}
              maxLength={40}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña (4 dígitos)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="input w-full text-center text-2xl tracking-widest"
              placeholder="****"
              required
              maxLength={4}
              inputMode="numeric"
            />
          </div>

          {error && (
            <div className="text-accent text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Cargando...' : isRegister ? 'Crear Cuenta' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-6 text-text-secondary">
          {isRegister ? '¿Ya tienes cuenta?' : '¿Primera vez?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-secondary hover:underline"
          >
            {isRegister ? 'Entrar' : 'Crear cuenta'}
          </button>
        </p>
      </div>
    </div>
  );
}