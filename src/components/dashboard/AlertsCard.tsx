import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Users, UserCheck, Calendar, ListTodo } from "lucide-react";
import Link from "next/link";

interface AlertsCardProps {
  alerts: {
    pendingApproval: number;
    visitorsNeedingFollowup: number;
    eventsLowFill: number;
    availableTasks: number;
  };
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  const alertItems = [
    {
      icon: UserCheck,
      count: alerts.pendingApproval,
      text: "membros aguardando aprovação",
      href: "/admin/pending-approval",
      show: alerts.pendingApproval > 0,
    },
    {
      icon: Users,
      count: alerts.visitorsNeedingFollowup,
      text: "visitantes sem follow-up (>15 dias)",
      href: "/admin/visitors",
      show: alerts.visitorsNeedingFollowup > 0,
    },
    {
      icon: Calendar,
      count: alerts.eventsLowFill,
      text: "eventos com tarefas <70% preenchidas",
      href: "/admin/events",
      show: alerts.eventsLowFill > 0,
    },
    {
      icon: ListTodo,
      count: alerts.availableTasks,
      text: "tarefas disponíveis sem voluntários",
      href: "/admin",
      show: alerts.availableTasks > 0,
    },
  ];

  const visibleAlerts = alertItems.filter((item) => item.show);

  if (visibleAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas e Ações Necessárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-sm text-muted-foreground">
                Tudo em ordem! Nenhum alerta no momento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Alertas e Ações Necessárias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleAlerts.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors border border-yellow-200 dark:border-yellow-900"
              >
                <Icon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-bold">{item.count}</span> {item.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
