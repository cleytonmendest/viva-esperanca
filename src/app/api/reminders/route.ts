import { NextResponse } from 'next/server';
// Importa o cliente genérico do Supabase para usar com a chave de serviço
import { createClient } from '@supabase/supabase-js';
// Importa os tipos gerados do banco de dados para garantir a segurança de tipos
import type { Tables } from '@/lib/supabase/database.types';

// Define que esta é uma "Edge Function", otimizada para ser rápida.
export const runtime = 'edge';

// --- FUNÇÃO DE COMPARAÇÃO SEGURA ---
// Compara strings de forma segura contra timing attacks
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    const bufferA = new TextEncoder().encode(a);
    const bufferB = new TextEncoder().encode(b);

    let result = 0;
    for (let i = 0; i < bufferA.length; i++) {
        result |= bufferA[i] ^ bufferB[i];
    }

    return result === 0;
}

// --- DEFINIÇÃO DE TIPOS PARA A RESPOSTA DA CONSULTA ---
// Isso descreve a estrutura dos dados que estamos buscando: um evento com suas escalas,
// e cada escala com os detalhes do membro e da tarefa.
// IMPORTANTE: members pode ser NULL quando o assignment não tem membro atribuído (member_id NULL)
type EventWithAssignments = Tables<'events'> & {
  event_assignments: (Tables<'event_assignments'> & {
    members: Tables<'members'> | null;
    tasks: Tables<'tasks'>;
  })[];
};


export async function GET(request: Request) {
    // --- VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE ---
    // Valida que as variáveis críticas estão configuradas (em runtime, não em build time)
    if (!process.env.N8N_API_SECRET) {
        console.error('[API Reminders] N8N_API_SECRET não está configurado');
        return new NextResponse(
            JSON.stringify({ message: 'Erro de configuração do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('[API Reminders] SUPABASE_SERVICE_ROLE_KEY não está configurado');
        return new NextResponse(
            JSON.stringify({ message: 'Erro de configuração do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.error('[API Reminders] NEXT_PUBLIC_SUPABASE_URL não está configurado');
        return new NextResponse(
            JSON.stringify({ message: 'Erro de configuração do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // --- Camada de Segurança ---
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.N8N_API_SECRET}`;

    // Comparação segura contra timing attacks
    const isValid = authHeader && timingSafeEqual(authHeader, expectedAuth);

    if (!isValid) {
        // Log de tentativa de acesso não autorizado
        console.warn('[API Reminders] Tentativa de acesso não autorizado', {
            timestamp: new Date().toISOString(),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent'),
        });

        return new NextResponse(
            JSON.stringify({ message: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Log de acesso autorizado (auditoria)
    console.log('[API Reminders] Acesso autorizado', {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

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
    // IMPORTANTE: members(*) usa LEFT JOIN para incluir assignments sem membros atribuídos
    // tasks!inner(*) usa INNER JOIN porque todo assignment DEVE ter uma task
    const { data, error } = await supabase
        .from('events')
        .select<string, EventWithAssignments>(`
            *,
            event_assignments (
                *,
                members(*),
                tasks!inner(*)
            )
        `)
        .gte('event_date', startTime.toISOString())
        .lte('event_date', endTime.toISOString());

    if (error) {
        // Log completo apenas no servidor (não expõe ao cliente)
        console.error('[API Reminders] Erro na consulta ao Supabase:', {
            timestamp: new Date().toISOString(),
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        // Retorna mensagem genérica ao cliente (não expõe detalhes internos)
        return new NextResponse(
            JSON.stringify({ message: 'Erro ao buscar lembretes' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // --- Filtragem dos Resultados para o n8n ---
    // Agora, 'event' e 'assignment' têm seus tipos corretos, eliminando o 'any'.
    // Retorna TODOS os assignments, incluindo aqueles sem membros atribuídos (member_id NULL)
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
        );


    // Log de sucesso (auditoria)
    console.log('[API Reminders] Consulta realizada com sucesso', {
        timestamp: new Date().toISOString(),
        totalEvents: data.length,
        totalAssignments: assignmentsWithMembers.length,
    });

    return NextResponse.json(assignmentsWithMembers);
}

// TODO: Implementar rate limiting para prevenir abuso
// Opções: Vercel Edge Config, Upstash Redis, ou middleware customizado

