import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

type SectorEnum = Database["public"]["Enums"]["sector_enum"];

export async function getAssignedTasks(memberId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_assignments")
    .select(
      `
      *,
      events (*),
      tasks (*)
    `
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assigned tasks:", error);
    return [];
  }

  return data;
}

export async function getAvailableTasks(sectors: SectorEnum[]) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_assignments")
    .select(
      `
      *,
      events (*),
      tasks!inner(*)
    `
    )
    .is("member_id", null)
    .in("tasks.sector", sectors)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching available tasks:", error);
    return [];
  }

  return data;
}

export async function getEventById(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }
  return data;
}

export async function getAssignmentsByEventId(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_assignments')
    .select(`
      *,
      tasks ( * ),
      members ( * )
    `)
    .eq('event_id', eventId);

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
  return data;
}

export async function getAllMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('members').select('id, name, sector');

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }
  return data;
}

export async function getAllTasks() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tasks').select('id, name');

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
  return data;
}

export async function getMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('members').select('*');

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }
  return data;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("members")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return profile;
}

// ========== DASHBOARD QUERIES ==========

/**
 * Calcula a data de início com base no período selecionado
 */
function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '30d':
      return new Date(now.setDate(now.getDate() - 30));
    case '3m':
      return new Date(now.setMonth(now.getMonth() - 3));
    case '6m':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
}

/**
 * Retorna estatísticas de membros para o dashboard
 */
export async function getDashboardMembersStats(period: string = '30d') {
  const supabase = await createClient();
  const startDate = getStartDate(period);

  // Executar todas as queries em paralelo para melhor performance
  const [
    { count: totalMembers },
    { count: pendingMembers },
    { count: newMembers },
    { data: membersBySector },
    { data: membersByRole },
  ] = await Promise.all([
    // Total de membros ativos
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ativo'),

    // Membros pendentes de aprovação
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'pendente'),

    // Novos membros no período
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString()),

    // Distribuição por setor
    supabase
      .from('members')
      .select('sector')
      .eq('status', 'ativo'),

    // Distribuição por role
    supabase
      .from('members')
      .select('role')
      .eq('status', 'ativo'),
  ]);

  // Contar membros por setor (membros podem ter múltiplos setores)
  const sectorCount: Record<string, number> = {};
  membersBySector?.forEach((member) => {
    member.sector?.forEach((sector) => {
      sectorCount[sector] = (sectorCount[sector] || 0) + 1;
    });
  });

  const roleCount: Record<string, number> = {};
  membersByRole?.forEach((member) => {
    roleCount[member.role] = (roleCount[member.role] || 0) + 1;
  });

  return {
    totalMembers: totalMembers || 0,
    pendingMembers: pendingMembers || 0,
    newMembers: newMembers || 0,
    sectorDistribution: sectorCount,
    roleDistribution: roleCount,
  };
}

/**
 * Retorna estatísticas de visitantes para o dashboard
 */
export async function getDashboardVisitorsStats(period: string = '30d') {
  const supabase = await createClient();
  const startDate = getStartDate(period);

  // Visitantes sem follow-up (mais de 15 dias)
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  // Preparar queries mensais para execução em paralelo
  const monthlyQueries = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    monthlyQueries.push({
      month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
      query: supabase
        .from('visitors')
        .select('id', { count: 'exact', head: true })
        .gte('visite_date', monthStart.toISOString())
        .lt('visite_date', monthEnd.toISOString()),
    });
  }

  // Executar todas as queries em paralelo
  const [
    { count: totalVisitors },
    { count: firstTimeVisitors },
    { data: visitorsByStatus },
    { count: visitorsNeedingFollowup },
    ...monthlyResults
  ] = await Promise.all([
    // Total de visitantes no período
    supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .gte('visite_date', startDate.toISOString()),

    // Visitantes de primeira vez
    supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .eq('first_time', true)
      .gte('visite_date', startDate.toISOString()),

    // Status dos visitantes (funil de conversão)
    supabase
      .from('visitors')
      .select('visitor_status')
      .gte('visite_date', startDate.toISOString()),

    // Visitantes sem follow-up
    supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .eq('visitor_status', 'sem_igreja')
      .lte('visite_date', fifteenDaysAgo.toISOString()),

    // Todas as queries mensais
    ...monthlyQueries.map((q) => q.query),
  ]);

  const statusCount = {
    sem_igreja: 0,
    congregando: 0,
    membro: 0,
    desistiu: 0,
  };
  visitorsByStatus?.forEach((visitor) => {
    if (visitor.visitor_status) {
      const status = visitor.visitor_status as keyof typeof statusCount;
      if (status in statusCount) {
        statusCount[status] = statusCount[status] + 1;
      }
    }
  });

  // Montar tendência mensal a partir dos resultados
  const monthlyTrend = monthlyQueries.map((q, index) => ({
    month: q.month,
    count: (monthlyResults[index] as { count: number | null }).count || 0,
  }));

  return {
    totalVisitors: totalVisitors || 0,
    firstTimeVisitors: firstTimeVisitors || 0,
    statusDistribution: statusCount,
    visitorsNeedingFollowup: visitorsNeedingFollowup || 0,
    monthlyTrend,
  };
}

/**
 * Retorna estatísticas de eventos para o dashboard
 */
export async function getDashboardEventsStats(period: string = '30d') {
  const supabase = await createClient();
  const now = new Date();
  const startDate = getStartDate(period);

  // Próximos eventos (7 dias)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select(`
      *,
      event_assignments (
        id,
        member_id,
        tasks (
          id,
          name,
          quantity
        )
      )
    `)
    .gte('event_date', now.toISOString())
    .lte('event_date', sevenDaysFromNow.toISOString())
    .order('event_date', { ascending: true });

  // Calcular taxa de preenchimento para cada evento
  const eventsWithFillRate = upcomingEvents?.map((event) => {
    const assignments = event.event_assignments || [];
    const totalTasks = assignments.length;
    const filledTasks = assignments.filter((a) => a.member_id !== null).length;
    const fillRate = totalTasks > 0 ? (filledTasks / totalTasks) * 100 : 0;

    return {
      id: event.id,
      name: event.name,
      event_date: event.event_date,
      totalTasks,
      filledTasks,
      fillRate: Math.round(fillRate),
    };
  });

  // Total de eventos no período
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('event_date', startDate.toISOString())
    .lte('event_date', now.toISOString());

  return {
    upcomingEvents: eventsWithFillRate || [],
    totalEvents: totalEvents || 0,
  };
}

/**
 * Retorna estatísticas de tarefas para o dashboard
 */
export async function getDashboardTasksStats(period: string = '30d') {
  const supabase = await createClient();

  // Tarefas pendentes por setor (sempre futuras, não usa filtro de período)
  const { data: tasksBySector } = await supabase
    .from('event_assignments')
    .select(`
      *,
      tasks (
        sector
      ),
      events (
        event_date
      )
    `)
    .gte('events.event_date', new Date().toISOString());

  const sectorStats: Record<string, { total: number; filled: number }> = {};

  tasksBySector?.forEach((assignment) => {
    const sector = assignment.tasks?.sector;
    if (sector) {
      if (!sectorStats[sector]) {
        sectorStats[sector] = { total: 0, filled: 0 };
      }
      sectorStats[sector].total += 1;
      if (assignment.member_id) {
        sectorStats[sector].filled += 1;
      }
    }
  });

  // Top membros mais engajados (usa o período selecionado)
  // Considera apenas eventos que já aconteceram (passado até hoje)
  const now = new Date();
  const startDate = getStartDate(period);

  // Começar pela tabela events para filtrar por data eficientemente
  const { data: eventsWithAssignments } = await supabase
    .from('events')
    .select(`
      event_date,
      event_assignments!inner (
        member_id,
        members (
          name
        )
      )
    `)
    .gte('event_date', startDate.toISOString())
    .lte('event_date', now.toISOString());

  const engagementCount: Record<string, { name: string; count: number }> = {};

  // Contar tarefas por membro
  eventsWithAssignments?.forEach((event) => {
    event.event_assignments?.forEach((assignment) => {
      const memberId = assignment.member_id;
      const memberName = assignment.members?.name;

      if (memberId && memberName) {
        if (!engagementCount[memberId]) {
          engagementCount[memberId] = { name: memberName, count: 0 };
        }
        engagementCount[memberId].count += 1;
      }
    });
  });

  const topMembers = Object.values(engagementCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Total de tarefas disponíveis (sem voluntários)
  const { count: availableTasks } = await supabase
    .from('event_assignments')
    .select('*', { count: 'exact', head: true })
    .is('member_id', null);

  return {
    sectorStats,
    topMembers,
    availableTasks: availableTasks || 0,
  };
}

/**
 * Retorna alertas para o dashboard
 */
export async function getDashboardAlerts() {
  const supabase = await createClient();

  // Visitantes sem follow-up (>15 dias)
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  // Eventos com tarefas <70% preenchidas (próximos 30 dias)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  // Executar todas as queries em paralelo
  const [
    { count: pendingApproval },
    { count: visitorsNeedingFollowup },
    { data: events },
    { count: availableTasks },
  ] = await Promise.all([
    // Membros aguardando aprovação
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'pendente'),

    // Visitantes sem follow-up
    supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .eq('visitor_status', 'sem_igreja')
      .lte('visite_date', fifteenDaysAgo.toISOString()),

    // Eventos próximos com assignments
    supabase
      .from('events')
      .select(`
        id,
        name,
        event_assignments (
          id,
          member_id
        )
      `)
      .gte('event_date', new Date().toISOString())
      .lte('event_date', thirtyDaysFromNow.toISOString()),

    // Tarefas disponíveis
    supabase
      .from('event_assignments')
      .select('id', { count: 'exact', head: true })
      .is('member_id', null),
  ]);

  const eventsLowFill = events?.filter((event) => {
    const assignments = event.event_assignments || [];
    const totalTasks = assignments.length;
    const filledTasks = assignments.filter((a) => a.member_id !== null).length;
    const fillRate = totalTasks > 0 ? (filledTasks / totalTasks) * 100 : 100;
    return fillRate < 70;
  }).length || 0;

  return {
    pendingApproval: pendingApproval || 0,
    visitorsNeedingFollowup: visitorsNeedingFollowup || 0,
    eventsLowFill,
    availableTasks: availableTasks || 0,
  };
}

/**
 * Retorna dados de crescimento de membros para gráfico de linha
 */
export async function getMembersGrowthData(period: string = '30d') {
  const supabase = await createClient();

  // Determinar quantos meses mostrar baseado no período
  let monthsToShow = 12;
  switch (period) {
    case '7d':
      monthsToShow = 3; // últimos 3 meses para contexto
      break;
    case '30d':
      monthsToShow = 6; // últimos 6 meses
      break;
    case '3m':
      monthsToShow = 3;
      break;
    case '6m':
      monthsToShow = 6;
      break;
    case '1y':
      monthsToShow = 12;
      break;
    default:
      monthsToShow = 6;
  }

  // Preparar queries mensais para execução em paralelo
  const monthlyQueries = [];
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    monthlyQueries.push({
      month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
      query: supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lt('created_at', monthEnd.toISOString()),
    });
  }

  // Executar todas as queries em paralelo
  const results = await Promise.all(monthlyQueries.map((q) => q.query));

  // Montar dados mensais a partir dos resultados
  const monthlyData = monthlyQueries.map((q, index) => ({
    month: q.month,
    count: results[index].count || 0,
  }));

  return monthlyData;
}

/**
 * Retorna todos os posts do blog com informações de autor e categoria
 */
export async function getAllPosts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      members (id, name),
      post_categories (id, name, slug)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data;
}

/**
 * Retorna um post específico por ID
 */
export async function getPostById(postId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      members (id, name),
      post_categories (id, name, slug)
    `)
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return data;
}

/**
 * Retorna todas as categorias de posts
 */
export async function getAllCategories() {
  const supabase = await createClient();

  const { data, error} = await supabase
    .from('post_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}

// ========== AUDIT LOG QUERIES ==========

/**
 * Retorna os logs de auditoria mais recentes com paginação
 */
export async function getRecentAuditLogs(limit: number = 50, offset: number = 0) {
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return { logs: [], total: 0 };
  }

  return { logs: data || [], total: count || 0 };
}

/**
 * Retorna logs de auditoria filtrados por tipo de ação
 */
export async function getAuditLogsByActionType(
  actionType: string,
  limit: number = 50
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('action_type', actionType)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs by action:', error);
    return [];
  }

  return data || [];
}

/**
 * Retorna logs de auditoria de um membro específico
 */
export async function getAuditLogsByMember(
  userId: string,
  limit: number = 50
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs by member:', error);
    return [];
  }

  return data || [];
}

/**
 * Retorna estatísticas de engajamento de membros
 * (quantas tarefas cada membro aceitou em um período)
 */
export async function getMemberEngagementStats(period: string = '30d') {
  const supabase = await createClient();
  const startDate = getStartDate(period);

  const { data, error } = await supabase
    .from('audit_logs')
    .select('user_id, member_name, action_type, details')
    .in('action_type', ['task_assigned', 'task_self_assigned'])
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching member engagement:', error);
    return [];
  }

  // Agrupar por membro e contar ações
  const engagementMap: Record<string, { name: string; tasks: number; selfAssigned: number }> = {};

  data?.forEach((log) => {
    const userId = log.user_id || 'unknown';
    const memberName = log.member_name || 'Desconhecido';

    if (!engagementMap[userId]) {
      engagementMap[userId] = {
        name: memberName,
        tasks: 0,
        selfAssigned: 0,
      };
    }

    engagementMap[userId].tasks += 1;
    if (log.action_type === 'task_self_assigned') {
      engagementMap[userId].selfAssigned += 1;
    }
  });

  // Converter para array e ordenar por número de tarefas
  return Object.entries(engagementMap)
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.tasks - a.tasks);
}

/**
 * Retorna atividades recentes para o dashboard
 */
export async function getDashboardActivities(limit: number = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching dashboard activities:', error);
    return [];
  }

  return data || [];
}

/**
 * Retorna logs de auditoria com filtros opcionais
 */
export async function getFilteredAuditLogs(
  limit: number = 50,
  offset: number = 0,
  filters?: {
    type?: string;
    period?: string;
  }
) {
  const supabase = await createClient();

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // Filtro por tipo
  if (filters?.type && filters.type !== 'all') {
    const typeMap: Record<string, string[]> = {
      tasks: ['task_assigned', 'task_self_assigned', 'task_removed'],
      events: ['event_created', 'event_updated', 'event_deleted'],
      members: ['member_created', 'member_updated', 'member_deleted', 'member_approved'],
      visitors: ['visitor_submitted', 'visitor_updated', 'visitor_deleted'],
    };

    const actionTypes = typeMap[filters.type];
    if (actionTypes) {
      query = query.in('action_type', actionTypes);
    }
  }

  // Filtro por período
  if (filters?.period && filters.period !== 'all') {
    const now = new Date();
    let startDate: Date;

    switch (filters.period) {
      case '24h':
        startDate = new Date(now.setHours(now.getHours() - 24));
        break;
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    query = query.gte('created_at', startDate.toISOString());
  }

  // Paginação
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching filtered audit logs:', error);
    return { logs: [], total: 0 };
  }

  return { logs: data || [], total: count || 0 };
}
