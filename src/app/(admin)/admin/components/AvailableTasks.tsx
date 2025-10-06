"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvailableTask } from "../lib/definitions";
import { assignTaskToSelf } from "../lib/actions";

interface AvailableTasksProps {
  tasks: AvailableTask[];
  memberId: string;
}

export default function AvailableTasks({ tasks, memberId }: AvailableTasksProps) {
  const [eventFilter, setEventFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);

  const handleAssignTask = async (formData: FormData) => {
    const result = await assignTaskToSelf(memberId, formData);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const processedTasks = [...tasks]
    .sort((a, b) => {
      const dateA = a.events?.event_date ? new Date(a.events.event_date).getTime() : 0;
      const dateB = b.events?.event_date ? new Date(b.events.event_date).getTime() : 0;
      return dateA - dateB;
    })
    .filter((assignment) => {
      if (showPastEvents) return true;
      const eventDate = assignment.events?.event_date
        ? new Date(assignment.events.event_date)
        : null;
      if (!eventDate) return true; // Keep tasks without a date
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare dates only
      return eventDate >= today;
    });

  const filteredTasks = processedTasks.filter((assignment) => {
    const eventName = assignment.events?.name?.toLowerCase() ?? "";
    const taskName = assignment.tasks?.name?.toLowerCase() ?? "";
    const eventDate = assignment.events?.event_date
      ? new Date(assignment.events.event_date).toLocaleDateString()
      : "";

    return (
      eventName.includes(eventFilter.toLowerCase()) &&
      taskName.includes(taskFilter.toLowerCase()) &&
      eventDate.includes(dateFilter)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas Disponíveis no seu Setor</CardTitle>
        <div className="mt-4 flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="event-filter">Evento</Label>
            <Input
              id="event-filter"
              placeholder="Filtrar por evento..."
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="task-filter">Tarefa</Label>
            <Input
              id="task-filter"
              placeholder="Filtrar por tarefa..."
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="date-filter">Data</Label>
            <Input
              id="date-filter"
              placeholder="Filtrar por data (dd/mm/aaaa)..."
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 pb-2">
            <input
              type="checkbox"
              id="show-past-tasks"
              checked={showPastEvents}
              onChange={(e) => setShowPastEvents(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="show-past-tasks">Mostrar eventos passados</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          {filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tarefa</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.events?.name ?? "N/A"}</TableCell>
                    <TableCell>{assignment.tasks?.name ?? "N/A"}</TableCell>
                    <TableCell>
                      {assignment.events?.event_date
                        ? new Date(
                            assignment.events.event_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={handleAssignTask}>
                        <input
                          type="hidden"
                          name="assignmentId"
                          value={assignment.id}
                        />
                        <Button size="sm">Assumir</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Nenhuma tarefa encontrada com os filtros aplicados.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
