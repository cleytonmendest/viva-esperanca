import { NextResponse } from 'next/server';
// Importa o cliente genérico do Supabase para usar com a chave de serviço
import { createClient } from '@supabase/supabase-js';
// Importa os tipos gerados do banco de dados para garantir a segurança de tipos
import type { Tables } from '@/libs/supabase/database.types';

// Define que esta é uma "Edge Function", otimizada para ser rápida.
export const runtime = 'edge';

// --- DEFINIÇÃO DE TIPOS PARA A RESPOSTA DA CONSULTA ---
// Isso descreve a estrutura dos dados que estamos buscando: um evento com suas escalas,
// e cada escala com os detalhes do membro e da tarefa.
type EventWithAssignments = Tables<'events'> & {
  event_assignments: (Tables<'event_assignments'> & {
    members: Tables<'members'>;
    tasks: Tables<'tasks'>;
  })[];
};


export async function GET(request: Request) {
    // --- Camada de Segurança ---
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.N8N_API_SECRET}`) {
        return new NextResponse(
            JSON.stringify({ message: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // --- Cliente de Serviço do Supabase ---
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Chave de serviço!
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
    );

    // --- LÓGICA DE DATA/HORA SIMPLIFICADA E ROBUSTA ---
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);

    // --- Consulta com a janela de tempo correta e TIPAGEM explícita ---
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
        .gte('event_date', startTime.toISOString())
        .lte('event_date', endTime.toISOString());

    if (error) {
        console.error('Erro na consulta ao Supabase:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // --- Filtragem dos Resultados para o n8n ---
    // Agora, 'event' e 'assignment' têm seus tipos corretos, eliminando o 'any'.
    const assignmentsWithMembers = data
        .flatMap(event => 
            event.event_assignments.map(assignment => ({
                ...assignment,
                event_details: {
                    id: event.id,
                    name: event.name,
                    event_date: event.event_date
                }
            }))
        )
        .filter(assignment => assignment.members);

    return NextResponse.json(assignmentsWithMembers);
}

