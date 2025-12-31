import MyAssignmentsRefactored from "./components/MyAssignmentsRefactored";
import AvailableTasksRefactored from "./components/AvailableTasksRefactored";
import {
  getAssignedTasks,
  getAvailableTasks,
  getAllMembers,
  getProfile,
  getDashboardMembersStats,
  getDashboardAlerts,
  getDashboardActivities,
  getTopActiveMembers,
} from "./queries";
import { ExecutiveSummaryCard } from "@/components/dashboard/ExecutiveSummaryCard";
import { ActivitiesWidget } from "@/components/dashboard/ActivitiesWidget";
import { TopMembersWidget } from "@/components/dashboard/TopMembersWidget";

export default async function Admin() {
  const profile = await getProfile();
  // Verifica se é líder usando o novo sistema de roles dinâmicas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLeader = profile ? (profile as any).roles?.is_leadership : false;

  // Mapeamento de nome do setor (titlecase) para enum (lowercase)
  const sectorNameToEnum: Record<string, string> = {
    'Mídia': 'mídia',
    'Geral': 'geral',
    'Louvor': 'louvor',
    'Infantil': 'infantil',
    'Social': 'social'
  };

  // Buscar dados básicos (todos os usuários veem)
  const [assignedTasks, availableTasks, allMembers, recentActivities] = await Promise.all([
    profile ? getAssignedTasks(profile.id) : Promise.resolve([]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (profile as any)?.sectors?.name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? getAvailableTasks([sectorNameToEnum[(profile as any).sectors.name] || (profile as any).sectors.name.toLowerCase()])
      : Promise.resolve([]),
    getAllMembers(),
    getDashboardActivities(5), // Últimas 5 atividades
  ]);

  // Se for líder, buscar também dados do resumo executivo
  let membersStats = null;
  let alerts = null;
  let topMembers = null;

  if (isLeader) {
    [membersStats, alerts, topMembers] = await Promise.all([
      getDashboardMembersStats('30d'),
      getDashboardAlerts(),
      getTopActiveMembers('30d')
    ]);
  }

  // Calcular estatísticas pessoais
  // const pendingTasks = assignedTasks.filter(
  //   (task) => task.status === "pendente"
  // ).length;
  // const confirmedTasks = assignedTasks.filter(
  //   (task) => task.status === "confirmado"
  // ).length;

  return (
    <main className="p-4 space-y-6">
      {/* Saudação Personalizada */}
      <section>
        <h1 className="text-2xl font-bold">Olá, {profile?.name ?? "Membro"}! 👋</h1>
        {/* <p className="text-muted-foreground">
          Você tem {confirmedTasks} {confirmedTasks === 1 ? "tarefa confirmada" : "tarefas confirmadas"}
          {pendingTasks > 0 && (
            <span className="text-yellow-600 font-medium">
              {" "}e {pendingTasks} {pendingTasks === 1 ? "pendente" : "pendentes"} de confirmação
            </span>
          )}
        </p> */}
      </section>

      {/* Alerta pessoal se houver tarefas não confirmadas */}
      {/* {pendingTasks > 0 && (
        <section className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Você tem {pendingTasks} {pendingTasks === 1 ? "tarefa" : "tarefas"} não {pendingTasks === 1 ? "confirmada" : "confirmadas"}
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Por favor, confirme ou recuse as tarefas atribuídas a você.
              </p>
            </div>
          </div>
        </section>
      )} */}

      {/* Resumo Executivo (apenas para líderes) */}
      {isLeader && membersStats && alerts && (
        <section>
          <ExecutiveSummaryCard
            stats={{
              totalMembers: membersStats.totalMembers,
              pendingApproval: alerts.pendingApproval,
              availableTasks: alerts.availableTasks,
              visitorsNeedingFollowup: alerts.visitorsNeedingFollowup,
            }}
          />
        </section>
      )}

      {/* Top Membros Mais Ativos (apenas para líderes) */}
      {isLeader && topMembers && (
        <section>
          <TopMembersWidget members={topMembers} period="30d" />
        </section>
      )}

      {/* Widget de Atividades Recentes (todos veem) */}
      <section>
        <ActivitiesWidget activities={recentActivities} />
      </section>

      {/* Minhas Tarefas */}
      <section>
        <MyAssignmentsRefactored tasks={assignedTasks} />
      </section>

      {/* Tarefas Disponíveis */}
      <section>
        <AvailableTasksRefactored tasks={availableTasks} allMembers={allMembers} />
      </section>
    </main>
  );
}
