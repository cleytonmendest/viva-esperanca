"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/format";
import { AssignedTask } from "../lib/definitions";
import { Label } from "@/components/ui/label";

interface MyAssignmentsProps {
  tasks: AssignedTask[];
}

export default function MyAssignments({ tasks }: MyAssignmentsProps) {
  const [showPastEvents, setShowPastEvents] = useState(false);

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.events?.event_date ? new Date(a.events.event_date).getTime() : 0;
    const dateB = b.events?.event_date ? new Date(b.events.event_date).getTime() : 0;
    return dateA - dateB;
  });

  const filteredTasks = showPastEvents
    ? sortedTasks
    : sortedTasks.filter((assignment) => {
        const eventDate = assignment.events?.event_date
          ? new Date(assignment.events.event_date)
          : null;
        if (!eventDate) return true; // Keep tasks without a date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        return eventDate >= today;
      });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Minhas Tarefas</CardTitle>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="show-past-events"
            checked={showPastEvents}
            onChange={(e) => setShowPastEvents(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="show-past-events">Mostrar eventos passados</Label>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTasks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Tarefa</TableHead>
                <TableHead className="text-right">Data do Evento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.events?.name ?? "N/A"}</TableCell>
                  <TableCell>{assignment.tasks?.name ?? "N/A"}</TableCell>
                  <TableCell className="text-right">
                    {assignment.events?.event_date
                      ? formatDate(assignment.events.event_date)
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>Você ainda não foi atribuído a nenhuma tarefa.</p>
        )}
      </CardContent>
    </Card>
  );
}
