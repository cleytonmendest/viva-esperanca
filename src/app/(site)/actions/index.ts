'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TablesInsert } from '@/lib/supabase/database.types';
import { unmaskPhoneNumber } from '@/lib/format';

type ContactMessageData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export async function sendContactMessage(data: ContactMessageData) {
  const supabase = await createClient();

  try {
    // Formatar mensagem completa para salvar na tabela message
    const fullMessage = `
📧 CONTATO DO SITE
━━━━━━━━━━━━━━━━━━

👤 Nome: ${data.name}
📧 Email: ${data.email}
📞 Telefone: ${data.phone}

💬 Mensagem:
${data.message}
━━━━━━━━━━━━━━━━━━
    `.trim();

    const { error } = await supabase.from('message').insert([
      {
        phone: data.phone,
        message: fullMessage,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('Erro ao enviar mensagem de contato:', error);
      return {
        success: false,
        message: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
      };
    }

    revalidatePath('/contato');

    return {
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
    };
  } catch (error) {
    console.error('Erro ao processar mensagem de contato:', error);
    return {
      success: false,
      message: 'Erro ao processar sua mensagem. Tente novamente.',
    };
  }
}

export async function submitVisitorForm(formData: Omit<TablesInsert<'visitors'>, 'created_at' | 'id'>) {
  try {
    const supabase = await createClient();

    // Remove máscara do telefone antes de salvar
    const cleanPhone = unmaskPhoneNumber(formData.visitor_whatsapp);

    const visitorData: TablesInsert<'visitors'> = {
      visitor_name: formData.visitor_name,
      visitor_whatsapp: cleanPhone,
      visitor_city: formData.visitor_city || null,
      visite_date: formData.visite_date,
      first_time: formData.first_time ?? true,
      event_name: formData.event_name || null,
      invited_by: formData.invited_by || null,
      how_found_church: formData.how_found_church || null,
      prayer_requests: formData.prayer_requests || null,
      consent_lgpd: formData.consent_lgpd ?? false,
      visitor_status: null, // Será preenchido pelo admin posteriormente
    };

    const { error } = await supabase
      .from('visitors')
      .insert([visitorData]);

    if (error) {
      console.error('Erro ao cadastrar visitante:', error);
      return {
        success: false,
        message: 'Não foi possível processar seu cadastro. Por favor, tente novamente.'
      };
    }

    return {
      success: true,
      message: 'Cadastro realizado com sucesso! Em breve entraremos em contato.'
    };
  } catch (error) {
    console.error('Erro inesperado:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.'
    };
  }
}
