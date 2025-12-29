'use server';

import { createClient } from '@/lib/supabase/server';
import { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';
import { revalidatePath } from 'next/cache';
import {
  logTaskAssignment,
  logTaskRemoval,
  logEventAction,
  logMemberAction
} from '@/lib/audit';

export async function assignTaskToSelf(memberId: string, formData: FormData) {
  const assignmentId = formData.get('assignmentId') as string;
  const supabase = await createClient();

  // Busca dados do assignment para o log
  const { data: assignment } = await supabase
    .from('event_assignments')
    .select('*, events(id, name), tasks(id, name), members(id, name)')
    .eq('id', assignmentId)
    .single();

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

  // Registra log de auditoria
  if (assignment) {
    const eventData = assignment.events as { id: string; name: string } | null;
    const taskData = assignment.tasks as { id: string; name: string } | null;
    const memberData = assignment.members as { id: string; name: string } | null;

    await logTaskAssignment({
      eventId: assignment.event_id,
      eventName: eventData?.name || 'Evento',
      taskId: assignment.task_id,
      taskName: taskData?.name || 'Tarefa',
      memberId,
      memberName: memberData?.name || 'Membro', // Em auto-atribuição, quem FEZ = quem RECEBE
      assignedToMemberName: memberData?.name || 'Membro', // Mesmo nome
      isSelfAssigned: true,
    });
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

  // Busca dados do assignment para o log
  const { data: assignment } = await supabase
    .from('event_assignments')
    .select('*, events(id, name), tasks(id, name)')
    .eq('id', assignmentId)
    .single();

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

  // Registra log de auditoria se houver membro atribuído
  if (assignment && memberId) {
    const { data: member } = await supabase
      .from('members')
      .select('name')
      .eq('id', memberId)
      .single();

    const eventData = assignment.events as { id: string; name: string } | null;
    const taskData = assignment.tasks as { id: string; name: string } | null;

    await logTaskAssignment({
      eventId: assignment.event_id,
      eventName: eventData?.name || 'Evento',
      taskId: assignment.task_id,
      taskName: taskData?.name || 'Tarefa',
      memberId,
      assignedToMemberName: member?.name || 'Membro', // Nome de quem RECEBE a tarefa
      isSelfAssigned: false,
      // NÃO passa memberName aqui - logAction vai buscar automaticamente quem está logado (quem FEZ a atribuição)
    });
  }

  revalidatePath(`/admin/events/${eventId}`);

  return {
    success: true,
    message: 'Tarefa atribuída com sucesso!',
  };
}

export async function addEvent(eventData: TablesInsert<'events'>) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('events').insert([eventData]).select().single();

  if (error) {
    console.error('Error adding event:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao adicionar o evento. Tente novamente mais tarde.',
    };
  }

  // Registra log de auditoria
  if (data) {
    await logEventAction({
      action: 'created',
      eventId: data.id,
      eventName: data.name,
      eventData: {
        event_date: data.event_date,
        description: data.description,
      },
    });
  }

  revalidatePath('/admin/events');

  return {
    success: true,
    message: 'Evento adicionado com sucesso!',
  };
}

export async function updateEvent(eventId: string, eventData: TablesUpdate<'events'>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao atualizar o evento. Tente novamente mais tarde.',
    };
  }

  // Registra log de auditoria
  if (data) {
    await logEventAction({
      action: 'updated',
      eventId: data.id,
      eventName: data.name,
      eventData: { changes: eventData },
    });
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

  // Busca dados do assignment antes de deletar para o log
  const { data: assignment } = await supabase
    .from('event_assignments')
    .select('*, events(name), tasks(name), members(name)')
    .eq('id', assignmentId)
    .single();

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

  // Registra log de auditoria
  if (assignment && assignment.member_id) {
    const eventData = assignment.events as { name: string } | null;
    const taskData = assignment.tasks as { name: string } | null;
    const memberData = assignment.members as { name: string } | null;

    await logTaskRemoval({
      eventId: assignment.event_id,
      eventName: eventData?.name || 'Evento',
      taskId: assignment.task_id,
      taskName: taskData?.name || 'Tarefa',
      memberId: assignment.member_id,
      removedFromMemberName: memberData?.name || 'Membro', // Nome de quem TINHA a tarefa removida
    });
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

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();

  // Busca dados do evento antes de deletar para o log
  const { data: event } = await supabase
    .from('events')
    .select('id, name, event_date')
    .eq('id', eventId)
    .single();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting event:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao remover o evento. Tente novamente.',
    };
  }

  // Registra log de auditoria
  if (event) {
    await logEventAction({
      action: 'deleted',
      eventId: event.id,
      eventName: event.name,
      eventData: {
        event_date: event.event_date,
      },
    });
  }

  revalidatePath('/admin/events');

  return {
    success: true,
    message: 'Evento removido com sucesso!',
  };
}

export async function updateVisitor(visitorId: string, visitorData: TablesUpdate<'visitors'>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('visitors')
    .update(visitorData)
    .eq('id', visitorId);

  if (error) {
    console.error('Error updating visitor:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao atualizar o visitante. Tente novamente mais tarde.',
    };
  }

  revalidatePath('/admin/visitors');

  return {
    success: true,
    message: 'Visitante atualizado com sucesso!',
  };
}

export async function deleteVisitor(visitorId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('visitors')
    .delete()
    .eq('id', visitorId);

  if (error) {
    console.error('Error deleting visitor:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao remover o visitante. Tente novamente.',
    };
  }

  revalidatePath('/admin/visitors');

  return {
    success: true,
    message: 'Visitante removido com sucesso!',
  };
}

/**
 * Atualiza o status de uma atribuição (confirmado/recusado)
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  status: 'confirmado' | 'recusado'
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_assignments')
    .update({ status })
    .eq('id', assignmentId);

  if (error) {
    console.error('Error updating assignment status:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao atualizar o status. Tente novamente.',
    };
  }

  revalidatePath('/admin');

  return {
    success: true,
    message: status === 'confirmado'
      ? 'Tarefa confirmada com sucesso!'
      : 'Tarefa recusada.',
  };
}

/**
 * Atribui uma tarefa a um membro específico
 */
export async function assignTaskToMember(
  assignmentId: string,
  memberId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('event_assignments')
    .update({
      member_id: memberId,
      status: 'confirmado'
    })
    .eq('id', assignmentId);

  if (error) {
    console.error('Error assigning task to member:', error);
    return {
      success: false,
      message: 'Tivemos um problema ao atribuir a tarefa. Tente novamente.',
    };
  }

  revalidatePath('/admin');

  return {
    success: true,
    message: 'Você se voluntariou para esta tarefa!',
  };
}

/**
 * Cria um novo post no blog
 */
export async function addPost(postData: TablesInsert<'posts'>) {
  const supabase = await createClient();

  const { error } = await supabase.from('posts').insert([postData]);

  if (error) {
    console.error('Error adding post:', error);
    return {
      success: false,
      message: 'Erro ao criar o post. Tente novamente.',
    };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');

  return {
    success: true,
    message: 'Post criado com sucesso!',
  };
}

/**
 * Atualiza um post existente
 */
export async function updatePost(
  postId: string,
  postData: TablesUpdate<'posts'>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('posts')
    .update(postData)
    .eq('id', postId);

  if (error) {
    console.error('Error updating post:', error);
    return {
      success: false,
      message: 'Erro ao atualizar o post. Tente novamente.',
    };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');

  return {
    success: true,
    message: 'Post atualizado com sucesso!',
  };
}

/**
 * Deleta um post
 */
export async function deletePost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    return {
      success: false,
      message: 'Erro ao deletar o post. Tente novamente.',
    };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');

  return {
    success: true,
    message: 'Post deletado com sucesso!',
  };
}
