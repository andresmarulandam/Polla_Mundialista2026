import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const session = await verifySession(token);

  if (!session?.is_admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  await supabaseAdmin.from('predictions').delete().eq('user_id', id);
  await supabaseAdmin.from('users').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
