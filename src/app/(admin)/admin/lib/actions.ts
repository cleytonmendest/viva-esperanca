'use server';

import { createClient } from '@/libs/supabase/server';
import { TablesInsert, TablesUpdate } from '@/libs/supabase/database.types';
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

export async function addAssignmentToEvent(eventId: string, taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_assignments')
    .insert({
      event_id: eventId,
      task_id: taskId,
    });

  if (error) {
    console.error('Error adding assignment:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao adicionar a tarefa. Tente novamente.',
    };
  }

  revalidatePath(`/admin/events/${eventId}`);

  return {
    success: true,
    message: 'Tarefa adicionada ao evento com sucesso!',
  };
}

export async function updateAssignmentMember(assignmentId: string, memberId: string | null, eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_assignments')
    .update({ member_id: memberId })
    .eq('id', assignmentId);

  if (error) {
    console.error('Error updating assignment:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao atribuir a tarefa. Tente novamente.',
    };
  }

  revalidatePath(`/admin/events/${eventId}`);

  return {
    success: true,
    message: 'Tarefa atribuída com sucesso!',
  };
}

export async function addEvent(eventData: TablesInsert<'events'>) {
  const supabase = await createClient();

  const { error } = await supabase.from('events').insert([eventData]);

  if (error) {
    console.error('Error adding event:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao adicionar o evento. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/admin/events');

  return {
    success: true,
    message: 'Evento adicionado com sucesso!',
  };
}

export async function updateEvent(eventId: string, eventData: TablesUpdate<'events'>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId);

  if (error) {
    console.error('Error updating event:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao atualizar o evento. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/admin/events');

  return {
    success: true,
    message: 'Evento atualizado com sucesso!',
  };
}

export async function addMember(memberData: TablesInsert<'members'>) {
  const supabase = await createClient();

  const { error } = await supabase.from('members').insert([memberData]);

  if (error) {
    console.error('Error adding member:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao adicionar o membro. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/admin/members');

  return {
    success: true,
    message: 'Membro adicionado com sucesso!',
  };
}

export async function updateMember(memberId: string, memberData: TablesUpdate<'members'>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('members')
    .update(memberData)
    .eq('id', memberId);

  if (error) {
    console.error('Error updating member:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao atualizar o membro. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/admin/members');

  return {
    success: true,
    message: 'Membro atualizado com sucesso!',
  };
}

export async function deleteAssignment(assignmentId: string, eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    console.error('Error deleting assignment:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao remover a tarefa. Tente novamente.',
    };
  }

  revalidatePath(`/admin/events/${eventId}`);

  return {
    success: true,
    message: 'Tarefa removida do evento com sucesso!',
  };
}

export async function addTask(taskData: TablesInsert<'tasks'>) {
  const supabase = await createClient();

  const { error } = await supabase.from('tasks').insert([taskData]);

  if (error) {
    console.error('Erro ao adicionar tarefa:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao adicionar a tarefa. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/admin/tasks');

  return {
    success: true,
    message: 'Tarefa adicionada com sucesso!',
  };
}

export async function addVisitor(visitorData: TablesInsert<'visitors'>) {
  const supabase = await createClient();

  const { error } = await supabase.from('visitors').insert([visitorData]);

  if (error) {
    console.error('Erro ao adicionar visitante:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao adicionar o visitante. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/admin/visitors');

  return {
    success: true,
    message: 'Visitante adicionado com sucesso!',
  };
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao remover a tarefa. Tente novamente.',
    };
  }

  revalidatePath('/admin/tasks');

  return {
    success: true,
    message: 'Tarefa removida com sucesso!',
  };
}

export async function updateTask(taskId: string, taskData: TablesUpdate<'tasks'>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', taskId);

  if (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao atualizar a tarefa. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/admin/tasks');

  return {
    success: true,
    message: 'Tarefa editada com sucesso!',
  };
}
