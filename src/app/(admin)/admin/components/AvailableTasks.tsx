"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvailableTask } from "../types";
import { useAuthStore } from "@/stores/authStore";
import LeaderAssignment from "../events/[id]/components/LeaderAssignment";
import MemberAssignment from "../events/[id]/components/MemberAssignment";
import { Assignment } from "../events/[id]/components/EventAssignmentTable";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AvailableTasksProps {
  tasks: AvailableTask[];
  allMembers: ({ id: string; name: string; sectors: { id: string; name: string } | null; })[];
}

export default function AvailableTasks({ tasks, allMembers }: AvailableTasksProps) {
  const { profile } = useAuthStore();
  const [eventFilter, setEventFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);

  const isLeader = useMemo(() => {
    if (!profile) return false;
    // Usa sistema dinâmico de roles via FK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (profile as any).roles?.is_leadership || false;
  }, [profile]);

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

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      const eventId = task.events?.id;
      if (!eventId) return acc;

      if (!acc[eventId]) {
        acc[eventId] = {
          event: task.events,
          tasks: [],
        };
      }
      acc[eventId].tasks.push(task);
      return acc;
    }, {} as Record<string, { event: AvailableTask['events'], tasks: AvailableTask[] }>);
  }, [filteredTasks]);

  const toggleCollapsible = (eventId: string) => {
    setOpenCollapsibles(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas Disponíveis no seu Setor</CardTitle>
        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          <div className="flex gap-2.5">
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
          </div>
          <div className="flex gap-2.5">
            <div className="flex-1 space-y-2">
              <Label htmlFor="date-filter">Data</Label>
              <Input
                id="date-filter"
                placeholder="Filtrar por data (dd/mm/aaaa)..."
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex items-center max-w-[40%] pb-2">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[300px] h-full overflow-y-auto">
          {Object.values(groupedTasks).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedTasks).map(([eventId, { event, tasks }]) => (
                  <Collapsible key={eventId} asChild open={openCollapsibles.includes(eventId)} onOpenChange={() => toggleCollapsible(eventId)}>
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="cursor-pointer">
                          <TableCell>{event?.name ?? "N/A"}</TableCell>
                          <TableCell>
                            {event?.event_date
                              ? new Date(event.event_date).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="flex justify-end">
                            {openCollapsibles.includes(eventId) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild >
                        <tr>
                          <td colSpan={3} className="">
                            <Table className="bg-neutral-800 rounded-2xl">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Tarefa</TableHead>
                                  <TableHead className="text-right"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tasks.map((assignment) => {
                                  const assignmentForComponent: Assignment = {
                                    id: assignment.id,
                                    event_id: assignment.event_id,
                                    task_id: assignment.task_id,
                                    member_id: assignment.member_id,
                                    created_at: assignment.created_at,
                                    status: assignment.status,
                                    tasks: assignment.tasks,
                                    members: null,
                                  };
                                  return (
                                    <TableRow key={assignment.id}>
                                      <TableCell>{assignment.tasks?.name ?? "N/A"}</TableCell>
                                      <TableCell className="text-right">
                                        {isLeader ? (
                                          <LeaderAssignment assignment={assignmentForComponent} allMembers={allMembers.filter(member => member.sectors?.name.toLowerCase() === assignment.tasks?.sector)} />
                                        ) : (
                                          <MemberAssignment assignment={assignmentForComponent} />
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </td>
                        </tr>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
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
