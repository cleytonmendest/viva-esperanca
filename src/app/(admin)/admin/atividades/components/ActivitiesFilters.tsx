"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ActivitiesFiltersProps {
  currentType?: string;
  currentPeriod?: string;
}

export function ActivitiesFilters({ currentType, currentPeriod }: ActivitiesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Reset para página 1 quando mudar filtros
    params.delete('page');

    router.push(`/admin/atividades?${params.toString()}`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          {/* Filtro por Tipo */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Tipo:</label>
            <Select
              value={currentType || 'all'}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="tasks">Tarefas</SelectItem>
                <SelectItem value="events">Eventos</SelectItem>
                <SelectItem value="members">Membros</SelectItem>
                <SelectItem value="visitors">Visitantes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Período */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Período:</label>
            <Select
              value={currentPeriod || '30d'}
              onValueChange={(value) => handleFilterChange('period', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Últimos 30 dias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todos os períodos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
