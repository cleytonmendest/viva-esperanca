"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { AvailableTask } from "../types";
import { useAuthStore } from "@/stores/authStore";
import { assignTaskToMember } from "../actions";
import { toast } from "sonner";
import { Calendar, Search, Users, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AvailableTasksRefactoredProps {
  tasks: AvailableTask[];
  allMembers: { id: string; name: string; sectors: { id: string; name: string } | null }[];
}

const SECTOR_LABELS: Record<string, string> = {
  mídia: "Mídia",
  geral: "Geral",
  louvor: "Louvor",
  infantil: "Infantil",
  social: "Social",
};

const SECTOR_COLORS: Record<string, string> = {
  mídia: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  geral: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  louvor: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  infantil: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  social: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function AvailableTasksRefactored({
  tasks,
  allMembers,
}: AvailableTasksRefactoredProps) {
  const { profile } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [showPast, setShowPast] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isLeader = useMemo(() => {
    if (!profile) return false;
    // Usa sistema dinâmico de roles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (profile as any).roles?.is_leadership || false;
  }, [profile]);

  // Filtrar tarefas
  const filteredTasks = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return tasks
      .filter((task) => {
        // Filtro de eventos passados
        if (!showPast) {
          const eventDate = task.events?.event_date
            ? new Date(task.events.event_date)
            : null;
          if (eventDate && eventDate < now) return false;
        }

        // Filtro de setor
        if (sectorFilter !== "all" && task.tasks?.sector !== sectorFilter) {
          return false;
        }

        // Filtro de busca
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const eventName = task.events?.name?.toLowerCase() || "";
          const taskName = task.tasks?.name?.toLowerCase() || "";
          return eventName.includes(search) || taskName.includes(search);
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = a.events?.event_date
          ? new Date(a.events.event_date).getTime()
          : 0;
        const dateB = b.events?.event_date
          ? new Date(b.events.event_date).getTime()
          : 0;
        return dateA - dateB;
      });
  }, [tasks, sectorFilter, searchTerm, showPast]);

  // Obter setores únicos disponíveis
  const availableSectors = useMemo(() => {
    const sectors = new Set(
      tasks.map((t) => t.tasks?.sector).filter(Boolean) as string[]
    );
    return Array.from(sectors).sort();
  }, [tasks]);

  const handleSelfAssign = async (assignmentId: string) => {
    if (!profile) {
      toast.error("Você precisa estar logado para atribuir tarefas.");
      return;
    }

    setLoadingId(assignmentId);
    const result = await assignTaskToMember(assignmentId, profile.id);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    setLoadingId(null);
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tarefas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-muted-foreground">
              Todas as tarefas do seu setor estão preenchidas!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Tarefas Disponíveis
        </CardTitle>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por evento ou tarefa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os setores</SelectItem>
              {availableSectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {SECTOR_LABELS[sector] || sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="rounded"
            />
            Mostrar passados
          </label>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma tarefa encontrada com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => {
              const eventDate = task.events?.event_date
                ? new Date(task.events.event_date)
                : null;
              const isUpcoming =
                eventDate &&
                eventDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
                eventDate.getTime() > Date.now();

              const sector = task.tasks?.sector || "";
              const sectorColor = SECTOR_COLORS[sector] || "bg-gray-500/10 text-gray-600 border-gray-500/20";

              return (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 space-y-3 hover:shadow-md transition-all ${
                    isUpcoming ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  {/* Header com Badge de Setor */}
                  <div className="flex items-start justify-between">
                    <Badge className={sectorColor}>
                      {SECTOR_LABELS[sector] || sector}
                    </Badge>
                    {isUpcoming && (
                      <Badge variant="default" className="text-xs">
                        Em breve!
                      </Badge>
                    )}
                  </div>

                  {/* Nome da Tarefa */}
                  <div>
                    <h4 className="font-semibold text-base mb-1">
                      {task.tasks?.name || "Tarefa sem nome"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {task.events?.name || "Evento sem nome"}
                    </p>
                  </div>

                  {/* Data do Evento */}
                  {eventDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(task.events!.event_date)}
                    </div>
                  )}

                  {/* Ação */}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleSelfAssign(task.id)}
                    disabled={loadingId === task.id}
                  >
                    {loadingId === task.id ? (
                      "Atribuindo..."
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Me voluntariar
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
