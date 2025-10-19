import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Tables } from '@/lib/supabase/database.types';

export const runtime = 'edge';

type MemberSchedule = Tables<'members'> & {
    event_assignments: (Tables<'event_assignments'> & {
        events: Pick<Tables<'events'>, 'name' | 'event_date'>;
        tasks: Pick<Tables<'tasks'>, 'name'>;
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

    const { searchParams } = new URL(request.url);
    const withSchedule = searchParams.get('with_schedule') === 'true';

    const selectStatement = withSchedule
        ? `*,
           event_assignments!inner (*,
                events (name, event_date),
                tasks (name)
           )`
        : `*,
           event_assignments (*,
                events (name, event_date),
                tasks (name)
           )`;

    let query = supabase
        .from('members')
        .select<string, MemberSchedule>(selectStatement);

    for (const [field, value] of searchParams.entries()) {
        if (field === 'with_schedule') continue;

        const [operator, ...filterValueParts] = value.split('.');
        const filterValue = filterValueParts.join('.');

        switch (operator) {
            case 'eq':
                query = query.eq(field, filterValue);
                break;
            case 'neq':
                query = query.neq(field, filterValue);
                break;
            case 'gt':
                query = query.gt(field, filterValue);
                break;
            case 'lt':
                query = query.lt(field, filterValue);
                break;
            case 'gte':
                query = query.gte(field, filterValue);
                break;
            case 'lte':
                query = query.lte(field, filterValue);
                break;
            case 'like':
                query = query.like(field, filterValue.replace(/\*/g, '%'));
                break;
            case 'ilike':
                query = query.ilike(field, filterValue.replace(/\*/g, '%'));
                break;
            case 'cs':
                query = query.contains(field, filterValue);
                break;
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error('Erro na consulta ao Supabase:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return NextResponse.json(data);
}
