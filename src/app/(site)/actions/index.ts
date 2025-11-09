'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
