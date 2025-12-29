import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle, UserPlus, Edit, Trash2, FileText, Hand } from "lucide-react";
import { Tables } from "@/lib/supabase/database.types";
import { formatRelativeTime } from "@/lib/format";

type AuditLog = Tables<'audit_logs'>;

interface ActivitiesWidgetProps {
  activities: AuditLog[];
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
  task_assigned: "text-green-600",
  task_self_assigned: "text-blue-600",
  task_removed: "text-red-600",
  event_created: "text-purple-600",
  event_updated: "text-yellow-600",
  event_deleted: "text-red-600",
  member_created: "text-green-600",
  member_updated: "text-yellow-600",
  member_approved: "text-green-600",
  visitor_submitted: "text-blue-600",
};

// Formatar descrição da atividade
function formatActivityDescription(log: AuditLog): string {
  const details = log.details as Record<string, any>;

  switch (log.action_type) {
    case 'task_assigned':
      return `Atribuiu tarefa "${details.task_name}" para ${details.assigned_to_member_name}`;

    case 'task_self_assigned':
      return `Assumiu tarefa "${details.task_name}"`;

    case 'task_removed':
      return `Removeu tarefa "${details.task_name}" de ${details.removed_from_member_name}`;

    case 'event_created':
      return `Criou evento "${details.event_name}"`;

    case 'event_updated':
      return `Editou evento "${details.event_name}"`;

    case 'event_deleted':
      return `Deletou evento "${details.event_name}"`;

    case 'member_approved':
      return `Aprovou membro ${details.member_name}`;

    case 'visitor_submitted':
      return `Visitante ${log.member_name} enviou formulário`;

    default:
      return `Executou ação: ${log.action_type}`;
  }
}

export function ActivitiesWidget({ activities }: ActivitiesWidgetProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma atividade registrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = actionIcons[activity.action_type] || Activity;
            const color = actionColors[activity.action_type] || "text-gray-600";

            return (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <Icon className={`h-5 w-5 mt-0.5 ${color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.member_name || 'Sistema'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/admin/atividades" className="block">
          <Button className="w-full" variant="outline">
            Ver todas as atividades
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
