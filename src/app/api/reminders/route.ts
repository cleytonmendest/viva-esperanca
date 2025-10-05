import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';

// Esta é uma "Edge Function", otimizada para ser rápida.
export const runtime = 'edge';

export async function GET(request: Request) {
    // --- Camada de Segurança ---
    // Verifica se a requisição veio com a chave secreta correta.
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.N8N_API_SECRET;

    // --- Bloco de Depuração ---
    // Em vez de bloquear, vamos retornar os valores para podermos compará-los.
    return NextResponse.json({
        message: "Modo de depuração ativo. Compare os valores abaixo.",
        receivedHeader: authHeader || "Nenhum header de autorização foi recebido.",
        expectedOnServer: `Bearer ${expectedSecret}` || "A variável N8N_API_SECRET não está configurada no servidor."
    });

    /* const supabase = await createClient();

    // Define o intervalo de tempo: de agora até as próximas 24 horas.
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // --- Consulta Única ao Supabase ---
    // Esta consulta faz tudo de uma vez:
    // 1. Filtra os eventos que acontecem nas próximas 24 horas.
    // 2. Pega apenas as escalas (assignments) que têm um membro associado.
    // 3. Junta os dados completos do evento, do membro e da tarefa.
    const { data, error } = await supabase
        .from('event_assignments')
        .select(`
      *,
      events!inner(*),
      members!inner(*),
      tasks!inner(*)
    `)
        .filter('events.event_date', 'gte', now.toISOString())
        .filter('events.event_date', 'lte', tomorrow.toISOString())
        .not('member_id', 'is', null);

    if (error) {
        console.error('Erro ao buscar escalas no Supabase:', error);
        return new NextResponse(
            JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Retorna os dados em formato JSON
    return NextResponse.json(data); */
}
