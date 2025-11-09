"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { AssignedTask } from "../types";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { updateAssignmentStatus } from "../actions";
import { toast } from "sonner";

interface MyAssignmentsRefactoredProps {
  tasks: AssignedTask[];
}

export default function MyAssignmentsRefactored({ tasks }: MyAssignmentsRefactoredProps) {
  const [showPast, setShowPast] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filtrar e ordenar tarefas
  const now = new Date();
  const filteredTasks = tasks
    .filter((task) => {
      if (showPast) return true;
      const eventDate = task.events?.event_date ? new Date(task.events.event_date) : null;
      return eventDate ? eventDate >= now : true;
    })
    .sort((a, b) => {
      const dateA = a.events?.event_date ? new Date(a.events.event_date).getTime() : 0;
      const dateB = b.events?.event_date ? new Date(b.events.event_date).getTime() : 0;
      return dateA - dateB;
    });

  // Agrupar por evento
  const groupedByEvent = filteredTasks.reduce((acc, task) => {
    const eventId = task.events?.id || "sem-evento";
    if (!acc[eventId]) {
      acc[eventId] = {
        event: task.events,
        tasks: [],
      };
    }
    acc[eventId].tasks.push(task);
    return acc;
  }, {} as Record<string, { event: AssignedTask["events"]; tasks: AssignedTask[] }>);

  // Determinar se o evento está próximo (< 7 dias)
  const isUpcoming = (eventDate: string | null | undefined) => {
    if (!eventDate) return false;
    const date = new Date(eventDate);
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const handleStatusChange = async (assignmentId: string, newStatus: "confirmado" | "recusado") => {
    setLoadingId(assignmentId);
    const result = await updateAssignmentStatus(assignmentId, newStatus);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    setLoadingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmado</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pendente</Badge>;
      case "recusado":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Recusado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (Object.keys(groupedByEvent).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Minhas Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Você ainda não tem tarefas atribuídas.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Confira as tarefas disponíveis abaixo!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Minhas Tarefas
        </CardTitle>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="rounded"
          />
          Mostrar passados
        </label>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedByEvent).map(([eventId, { event, tasks }]) => {
          const eventDate = event?.event_date ? new Date(event.event_date) : null;
          const isEventUpcoming = event?.event_date ? isUpcoming(event.event_date) : false;

          return (
            <div
              key={eventId}
              className={`border rounded-lg p-4 space-y-3 transition-colors ${
                isEventUpcoming ? "border-primary/50 bg-primary/5" : "border-border"
              }`}
            >
              {/* Cabeçalho do Evento */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">
                      {event?.name || "Evento sem nome"}
                    </h3>
                    {isEventUpcoming && (
                      <Badge variant="default" className="text-xs">
                        Em breve!
                      </Badge>
                    )}
                  </div>
                  {eventDate && event?.event_date && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(event.event_date)}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {tasks.length} {tasks.length === 1 ? "tarefa" : "tarefas"}
                </Badge>
              </div>

              {/* Lista de Tarefas */}
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-md border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {task.tasks?.name || "Tarefa sem nome"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(task.status)}
                        {task.tasks?.sector && (
                          <Badge variant="secondary" className="text-xs">
                            {task.tasks.sector}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Ações (apenas se pendente) */}
                    {task.status === "pendente" && (
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleStatusChange(task.id, "confirmado")}
                          disabled={loadingId === task.id}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleStatusChange(task.id, "recusado")}
                          disabled={loadingId === task.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
