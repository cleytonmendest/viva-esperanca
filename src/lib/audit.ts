import { createClient } from '@/lib/supabase/server';
import { TablesInsert, Json } from '@/lib/supabase/database.types';

type AuditLogInsert = TablesInsert<'audit_logs'>;

type ActionType =
  | 'task_assigned'
  | 'task_removed'
  | 'task_self_assigned'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'member_created'
  | 'member_updated'
  | 'member_deleted'
  | 'member_approved'
  | 'visitor_submitted'
  | 'visitor_updated'
  | 'visitor_deleted';

type ResourceType = 'event' | 'task' | 'member' | 'visitor' | 'event_assignment';

type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };

interface LogActionParams {
  actionType: ActionType;
  resourceType: ResourceType;
  resourceId?: string;
  details?: Record<string, JsonValue>;
  userId?: string;
  memberName?: string;
}

/**
 * Registra uma ação no sistema de auditoria
 */
export async function logAction({
  actionType,
  resourceType,
  resourceId,
  details = {},
  userId,
  memberName,
}: LogActionParams): Promise<void> {
  try {
    const supabase = await createClient();

    // Se não foi passado userId, tenta pegar do usuário autenticado
    let finalUserId = userId;
    let finalMemberName = memberName;

    if (!finalUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      finalUserId = user?.id;

      // Se temos user mas não temos memberName, busca do banco
      if (user && !finalMemberName) {
        const { data: member } = await supabase
          .from('members')
          .select('name')
          .eq('user_id', user.id)
          .single();

        finalMemberName = member?.name || 'Usuário desconhecido';
      }
    }

    const logEntry: AuditLogInsert = {
      user_id: finalUserId || null,
      member_name: finalMemberName || null,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId || null,
      details: details as Json,
    };

    const { error } = await supabase.from('audit_logs').insert([logEntry]);

    if (error) {
      console.error('Erro ao registrar log de auditoria:', error);
      // Não falha a operação principal se o log falhar
    }
  } catch (error) {
    console.error('Erro ao processar log de auditoria:', error);
    // Não falha a operação principal se o log falhar
  }
}

/**
 * Helper específico: Registra atribuição de tarefa
 *
 * IMPORTANTE:
 * - memberName: Nome de quem FEZ a atribuição (opcional - se não fornecido, busca automaticamente quem está logado)
 * - assignedToMemberName: Nome de quem RECEBEU a tarefa (obrigatório)
 * - Em auto-atribuição, memberName = assignedToMemberName
 * - Em atribuição por líder, memberName é omitido (busca automaticamente) e assignedToMemberName é o membro que recebeu
 */
export async function logTaskAssignment({
  eventId,
  eventName,
  taskId,
  taskName,
  memberId,
  memberName,
  assignedToMemberName,
  assignedBy,
  isSelfAssigned = false,
}: {
  eventId: string;
  eventName: string;
  taskId: string;
  taskName: string;
  memberId: string;
  memberName?: string; // Opcional - quem FEZ a atribuição
  assignedToMemberName?: string; // Quem RECEBEU a tarefa
  assignedBy?: string;
  isSelfAssigned?: boolean;
}) {
  await logAction({
    actionType: isSelfAssigned ? 'task_self_assigned' : 'task_assigned',
    resourceType: 'event_assignment',
    resourceId: eventId,
    details: {
      event_id: eventId,
      event_name: eventName,
      task_id: taskId,
      task_name: taskName,
      assigned_to_member_id: memberId,
      assigned_to_member_name: assignedToMemberName || memberName, // Nome de quem RECEBE
      assigned_by: assignedBy,
      is_self_assigned: isSelfAssigned,
    },
    memberName, // Nome de quem FEZ (se omitido, logAction busca automaticamente)
  });
}

/**
 * Helper específico: Registra remoção de tarefa
 *
 * IMPORTANTE:
 * - removedFromMemberName: Nome de quem TINHA a tarefa (que foi removida)
 * - logAction vai buscar automaticamente quem está logado (quem FEZ a remoção)
 */
export async function logTaskRemoval({
  eventId,
  eventName,
  taskId,
  taskName,
  memberId,
  removedFromMemberName,
}: {
  eventId: string;
  eventName: string;
  taskId: string;
  taskName: string;
  memberId: string;
  removedFromMemberName: string; // Nome de quem TINHA a tarefa
}) {
  await logAction({
    actionType: 'task_removed',
    resourceType: 'event_assignment',
    resourceId: eventId,
    details: {
      event_id: eventId,
      event_name: eventName,
      task_id: taskId,
      task_name: taskName,
      removed_from_member_id: memberId,
      removed_from_member_name: removedFromMemberName,
    },
    // NÃO passa memberName - logAction busca automaticamente quem está logado (quem FEZ a remoção)
  });
}

/**
 * Helper específico: Registra criação/edição/deleção de evento
 */
export async function logEventAction({
  action,
  eventId,
  eventName,
  eventData,
}: {
  action: 'created' | 'updated' | 'deleted';
  eventId: string;
  eventName: string;
  eventData?: Record<string, JsonValue>;
}) {
  await logAction({
    actionType: `event_${action}` as ActionType,
    resourceType: 'event',
    resourceId: eventId,
    details: {
      event_name: eventName,
      ...eventData,
    },
  });
}

/**
 * Helper específico: Registra ações de membro
 *
 * IMPORTANTE:
 * - memberName: Nome do membro que FOI AFETADO (criado/editado/deletado/aprovado)
 * - O nome de quem FEZ a ação é buscado automaticamente (usuário logado)
 * - Isso permite distinguir quando um líder atualiza outro membro vs auto-atualização
 */
export async function logMemberAction({
  action,
  memberId,
  memberName,
  changes,
}: {
  action: 'created' | 'updated' | 'deleted' | 'approved';
  memberId: string;
  memberName: string;
  changes?: Record<string, JsonValue>;
}) {
  await logAction({
    actionType: `member_${action}` as ActionType,
    resourceType: 'member',
    resourceId: memberId,
    details: {
      member_name: memberName, // Nome do membro AFETADO
      changes,
    },
    // NÃO passa memberName aqui - logAction busca automaticamente quem FEZ a ação
  });
}

/**
 * Helper específico: Registra submissão de visitante
 */
export async function logVisitorSubmission({
  visitorId,
  visitorName,
  visitorData,
}: {
  visitorId: string;
  visitorName: string;
  visitorData?: Record<string, JsonValue>;
}) {
  await logAction({
    actionType: 'visitor_submitted',
    resourceType: 'visitor',
    resourceId: visitorId,
    details: {
      visitor_name: visitorName,
      ...visitorData,
    },
    userId: undefined, // Visitante não tem userId
    memberName: visitorName,
  });
}
