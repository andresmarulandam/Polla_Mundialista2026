import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const session = await verifySession(token);

  if (!session || !session.is_admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('name');

  return NextResponse.json({ users: users || [] });
}