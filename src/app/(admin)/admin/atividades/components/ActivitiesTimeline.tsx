"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tables } from "@/lib/supabase/database.types";
import { formatRelativeTime } from "@/lib/format";
import { ChevronLeft, ChevronRight, Activity, CheckCircle, UserPlus, Edit, Trash2, FileText, Hand } from "lucide-react";
import Link from "next/link";

type AuditLog = Tables<'audit_logs'>;

interface ActivitiesTimelineProps {
  logs: AuditLog[];
  currentPage: number;
  totalPages: number;
  total: number;
}

// Mapeamento de ícones por tipo de ação
const actionIcons: Record<string, React.ElementType> = {
  task_assigned: CheckCircle,
  task_self_assigned: Hand,
  task_removed: Trash2,
  event_created: FileText,
  event_updated: Edit,
  event_deleted: Trash2,
  member_created: UserPlus,
  member_updated: Edit,
  member_approved: CheckCircle,
  visitor_submitted: UserPlus,
};

// Cores por tipo de ação
const actionColors: Record<string, string> = {
  task_assigned: "text-green-600 bg-green-50 dark:bg-green-950",
  task_self_assigned: "text-blue-600 bg-blue-50 dark:bg-blue-950",
  task_removed: "text-red-600 bg-red-50 dark:bg-red-950",
  event_created: "text-purple-600 bg-purple-50 dark:bg-purple-950",
  event_updated: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
  event_deleted: "text-red-600 bg-red-50 dark:bg-red-950",
  member_created: "text-green-600 bg-green-50 dark:bg-green-950",
  member_updated: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
  member_approved: "text-green-600 bg-green-50 dark:bg-green-950",
  visitor_submitted: "text-blue-600 bg-blue-50 dark:bg-blue-950",
};

// Formatar descrição da atividade
function formatActivityDescription(log: AuditLog): { title: string; subtitle: string } {
  const details = (log.details as Record<string, unknown>) || {};

  switch (log.action_type) {
    case 'task_assigned':
      return {
        title: `Atribuiu tarefa "${details.task_name}"`,
        subtitle: `Para: ${details.assigned_to_member_name} • Evento: ${details.event_name}`,
      };

    case 'task_self_assigned':
      return {
        title: `Assumiu tarefa "${details.task_name}"`,
        subtitle: `Evento: ${details.event_name}`,
      };

    case 'task_removed':
      return {
        title: `Removeu tarefa "${details.task_name}"`,
        subtitle: `De: ${details.removed_from_member_name} • Evento: ${details.event_name}`,
      };

    case 'event_created':
      return {
        title: `Criou evento "${details.event_name}"`,
        subtitle: details.event_date ? `Data: ${details.event_date}` : '',
      };

    case 'event_updated':
      return {
        title: `Editou evento "${details.event_name}"`,
        subtitle: 'Detalhes do evento foram atualizados',
      };

    case 'event_deleted':
      return {
        title: `Deletou evento "${details.event_name}"`,
        subtitle: '',
      };

    case 'member_approved':
      return {
        title: `Aprovou membro ${details.member_name}`,
        subtitle: 'Status alterado de pendente para ativo',
      };

    case 'visitor_submitted':
      return {
        title: `Visitante ${log.member_name} enviou formulário`,
        subtitle: details.event_name ? `Evento: ${details.event_name}` : '',
      };

    default:
      return {
        title: `Executou ação: ${log.action_type}`,
        subtitle: '',
      };
  }
}

export function ActivitiesTimeline({ logs, currentPage, totalPages, total }: ActivitiesTimelineProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Não há atividades registradas com os filtros selecionados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Informações de paginação */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Mostrando {(currentPage - 1) * 50 + 1} - {Math.min(currentPage * 50, total)} de {total} atividades
        </p>
        <p>
          Página {currentPage} de {totalPages}
        </p>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {logs.map((log, index) => {
            const Icon = actionIcons[log.action_type] || Activity;
            const colorClass = actionColors[log.action_type] || "text-gray-600 bg-gray-50";
            const { title, subtitle } = formatActivityDescription(log);

            return (
              <div
                key={log.id}
                className={`flex items-start gap-4 pb-4 ${
                  index !== logs.length - 1 ? 'border-b' : ''
                }`}
              >
                {/* Ícone */}
                <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {log.member_name || 'Sistema'}
                      </p>
                      <p className="text-sm text-foreground mt-1">
                        {title}
                      </p>
                      {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/atividades?page=${currentPage - 1}`}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          >
            <Button variant="outline" disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Link key={pageNum} href={`/admin/atividades?page=${pageNum}`}>
                  <Button
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
          </div>

          <Link
            href={`/admin/atividades?page=${currentPage + 1}`}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          >
            <Button variant="outline" disabled={currentPage >= totalPages}>
              Próxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
