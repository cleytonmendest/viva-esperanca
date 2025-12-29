import { getFilteredAuditLogs } from "../queries";
import { ActivitiesTimeline } from "./components/ActivitiesTimeline";
import { ActivitiesFilters } from "./components/ActivitiesFilters";
import { Activity } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
    period?: string;
  }>;
}

export default async function AtividadesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  // Buscar logs com filtros e paginação
  const { logs, total } = await getFilteredAuditLogs(limit, offset, {
    type: params.type,
    period: params.period || '30d',
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="p-4 space-y-6">
      {/* Header */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Atividades do Sistema</h1>
        </div>
        <p className="text-muted-foreground">
          Histórico completo de todas as ações registradas no sistema
        </p>
      </section>

      {/* Filtros */}
      <section>
        <ActivitiesFilters currentType={params.type} currentPeriod={params.period} />
      </section>

      {/* Timeline */}
      <section>
        <ActivitiesTimeline logs={logs} currentPage={page} totalPages={totalPages} total={total} />
      </section>
    </main>
  );
}
