import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Tables } from '@/lib/supabase/database.types';

export const runtime = 'edge';

type EventWithAssignments = Tables<'events'> & {
  event_assignments: (Tables<'event_assignments'> & {
    members: Tables<'members'>;
    tasks: Tables<'tasks'>;
  })[];
};

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.N8N_API_SECRET}`) {
        return new NextResponse(
            JSON.stringify({ message: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
    );

    const startTime = new Date();

    const { data, error } = await supabase
        .from('events')
        .select<string, EventWithAssignments>(`
            *,
            event_assignments (
                *,
                members!inner(*),
                tasks!inner(*)
            )
        `)
        .gte('event_date', startTime.toISOString());

    if (error) {
        console.error('Erro na consulta ao Supabase:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return NextResponse.json(data);
}
