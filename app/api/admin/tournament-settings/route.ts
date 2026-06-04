import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('tournament_settings')
    .select('*');

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: Record<string, string | null> = {};
  data?.forEach((row) => {
    settings[row.setting_key] = row.setting_value;
  });

  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token)
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const session = await verifySession(token);
  if (!session?.is_admin)
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const body = await request.json();
    const { champion, topScorer } = body;

    const updates = [];
    if (champion !== undefined) {
      updates.push(
        supabaseAdmin
          .from('tournament_settings')
          .upsert(
            {
              setting_key: 'champion',
              setting_value: champion,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'setting_key' },
          ),
      );
    }
    if (topScorer !== undefined) {
      updates.push(
        supabaseAdmin
          .from('tournament_settings')
          .upsert(
            {
              setting_key: 'top_scorer',
              setting_value: topScorer,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'setting_key' },
          ),
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
