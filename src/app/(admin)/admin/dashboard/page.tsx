import {
  getDashboardMembersStats,
  getDashboardVisitorsStats,
  getDashboardEventsStats,
  getDashboardTasksStats,
  getDashboardAlerts,
  getMembersGrowthData,
  getProfile,
} from "../queries";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { TasksBySector } from "@/components/dashboard/TasksBySector";
import { TopMembers } from "@/components/dashboard/TopMembers";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { MembersGrowthChart } from "@/components/dashboard/MembersGrowthChart";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { Users, UserCheck, Calendar, ListTodo } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";

interface DashboardProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  const profile = await getProfile();

  // Controle de acesso - apenas líderes e admins (usando sistema dinâmico)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLeader = profile ? (profile as any).roles?.is_leadership : false;

  if (!profile || !isLeader) {
    redirect('/admin/unauthorized');
  }

  const params = await searchParams;
  const period = params.period || "30d";

  const [
    membersStats,
    visitorsStats,
    eventsStats,
    tasksStats,
    alerts,
    growthData,
  ] = await Promise.all([
    getDashboardMembersStats(period),
    getDashboardVisitorsStats(period),
    getDashboardEventsStats(period),
    getDashboardTasksStats(period),
    getDashboardAlerts(),
    getMembersGrowthData(period),
  ]);

  return (
    <main className="p-4 space-y-6">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão geral das métricas e analytics da igreja
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-10 w-[180px]" />}>
          <PeriodFilter />
        </Suspense>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Membros"
          value={membersStats.totalMembers}
          subtitle={`${membersStats.pendingMembers} aguardando aprovação`}
          icon={Users}
          trend={{
            value: membersStats.newMembers,
            isPositive: true,
          }}
        />
        <StatsCard
          title="Visitantes"
          value={visitorsStats.totalVisitors}
          subtitle={`${visitorsStats.firstTimeVisitors} de primeira vez`}
          icon={UserCheck}
        />
        <StatsCard
          title="Eventos"
          value={eventsStats.totalEvents}
          subtitle="no período selecionado"
          icon={Calendar}
        />
        <StatsCard
          title="Tarefas Disponíveis"
          value={tasksStats.availableTasks}
          subtitle="aguardando voluntários"
          icon={ListTodo}
        />
      </section>

      {/* Alerts */}
      <section>
        <AlertsCard alerts={alerts} />
      </section>

      {/* Charts Row 1 */}
      <section className="grid gap-4 md:grid-cols-2">
        <ConversionFunnel data={visitorsStats.statusDistribution} />
        <UpcomingEvents events={eventsStats.upcomingEvents} />
      </section>

      {/* Charts Row 2 */}
      <section className="grid gap-4 md:grid-cols-2">
        <TasksBySector data={tasksStats.sectorStats} />
        <TopMembers members={tasksStats.topMembers} period={period} />
      </section>

      {/* Growth Chart */}
      <section>
        <MembersGrowthChart data={growthData} />
      </section>
    </main>
  );
}
