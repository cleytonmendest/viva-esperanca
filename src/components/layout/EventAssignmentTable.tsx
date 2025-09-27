'use client'

import { Tables } from "@/libs/supabase/database.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type Task = Tables<'tasks'>;
type Member = Tables<'members'>;
type Assignment = Tables<'event_assignments'> & {
  tasks: Task | null;
  members: Member | null;
};

interface EventAssignmentsTableProps {
  assignments: Assignment[];
  allMembers: { id: string; name: string }[];
  eventId: string
}

const EventAssignmentTable = ({ allMembers, assignments, eventId }: EventAssignmentsTableProps) => {

  const handleAssignMember = (assignmentId: string) => {
    // Lógica para abrir um Dialog/Modal, passando o assignmentId
    // e a lista `allMembers` para o modal.
    console.log("Atribuir membro para a vaga:", assignmentId);
  };

  console.log('Assignments:', assignments);
  console.log('All Members:', allMembers);
  console.log('Event ID:', eventId)

  if (assignments?.length === 0) return (<div>Nenhuma tarefa atribuída</div>)

  return (
    <div>
      <div></div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Voluntário</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments?.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.tasks?.name ?? 'Tarefa não encontrada'}</TableCell>
                <TableCell>
                  {assignment.tasks?.sector && <Badge>{assignment.tasks.sector}</Badge>}
                </TableCell>
                <TableCell>
                  {assignment.members ? (
                    assignment.members.name
                  ) : (
                    <Badge variant="outline">Vaga em aberto</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {assignment.members ? (
                    <Button variant="outline" size="sm">Alterar</Button>
                  ) : (
                    <Button size="sm" onClick={() => handleAssignMember(assignment.id)}>Atribuir</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default EventAssignmentTable