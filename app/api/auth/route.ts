import { NextRequest, NextResponse } from 'next/server';
import { createUser, authenticateUser, createSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, password, action } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Nombre y contraseña requeridos' },
        { status: 400 }
      );
    }

    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
      return NextResponse.json(
        { error: 'La contraseña debe ser de 4 dígitos' },
        { status: 400 }
      );
    }

    if (action === 'register') {
      const user = await createUser(name, password);
      if (!user) {
        const { data: existing } = await supabaseAdmin.from('users').select('id').eq('name', name).single();
        if (existing) {
          return NextResponse.json({ error: 'El nombre ya está registrado' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error al crear usuario' }, { status: 400 });
      }

      const token = await createSession(user);
      const response = NextResponse.json({ success: true, name: user.name });
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    const session = await authenticateUser(name, password);
    if (!session) {
      return NextResponse.json(
        { error: 'Nombre o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const token = await createSession(session as any);
    const response = NextResponse.json({ success: true, name: session.name });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}