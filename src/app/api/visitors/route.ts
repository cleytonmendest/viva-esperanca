import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitor_name, visitor_whatsapp, first_time, visitor_status, event_name, visite_date } = body;

    // Validation
    if (!visitor_name || !visitor_whatsapp) {
      return NextResponse.json(
        { success: false, message: 'Nome e WhatsApp são obrigatórios.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from('visitors').insert([
      {
        visitor_name,
        visitor_whatsapp,
        first_time: first_time ?? true,
        visitor_status: visitor_status || 'sem_igreja',
        event_name: event_name || null,
        visite_date: visite_date || new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error inserting visitor:', error);
      return NextResponse.json(
        { success: false, message: 'Erro ao salvar informações. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Obrigado! Suas informações foram enviadas com sucesso. Estamos ansiosos para te receber!',
    });
  } catch (error) {
    console.error('Error processing visitor form:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar requisição.' },
      { status: 500 }
    );
  }
}
