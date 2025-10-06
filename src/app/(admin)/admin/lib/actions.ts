'use server';

import { createClient } from '@/libs/supabase/server';
import { revalidatePath } from 'next/cache';

export async function assignTaskToSelf(memberId: string, formData: FormData) {
  const assignmentId = formData.get('assignmentId') as string;
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_assignments')
    .update({ member_id: memberId })
    .eq('id', assignmentId);

  if (error) {
    console.error('Error assigning task:', error);
    return {
      success: false,
      message: 'Erro ao assumir a tarefa. Tente novamente.',
    };
  }

  revalidatePath('/admin');

  return {
    success: true,
    message: 'Você assumiu a tarefa com sucesso!',
  };
}
