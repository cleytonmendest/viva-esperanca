"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDateTime } from "@/lib/format";
import { Calendar } from "lucide-react";

interface UpcomingEventsProps {
  events: Array<{
    id: string;
    name: string;
    event_date: string;
    totalTasks: number;
    filledTasks: number;
    fillRate: number;
  }>;
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Eventos (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum evento programado para os próximos 7 dias.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Eventos (7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{event.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(event.event_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {event.filledTasks}/{event.totalTasks} tarefas
                </p>
                <p
                  className={`text-xs ${
                    event.fillRate >= 70
                      ? "text-green-600"
                      : event.fillRate >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {event.fillRate}% completo
                </p>
              </div>
            </div>
            <Progress value={event.fillRate} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
