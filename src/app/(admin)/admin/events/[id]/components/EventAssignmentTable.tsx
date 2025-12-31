'use client'

import { Tables } from "@/lib/supabase/database.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/table";
import { Badge } from "../../../../../../components/ui/badge";
import { Input } from "../../../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/select";
import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import MemberAssignment from "./MemberAssignment";
import LeaderAssignment from "./LeaderAssignment";
import { toast } from "sonner";
import AddAssignmentDialog from "./AddAssignmentDialog"; // Importe o novo componente
import DeleteAssignment from "./DeleteAssignment";
import { deleteAssignment } from "../../../actions";

type Task = Tables<'tasks'>;
type Member = Tables<'members'>;
type Sector = Tables<'sectors'>;
export type Assignment = Tables<'event_assignments'> & {
  tasks: Task | null;
  members: Member | null;
};

interface EventAssignmentsTableProps {
  assignments: Assignment[];
  allMembers: ({ id: string; name: string; sectors: { id: string; name: string } | null; })[];
  allTasks: { id: string; name: string }[];
  allSectors: Sector[];
  eventId: string;
}

const EventAssignmentTable = ({ allMembers, assignments, allTasks, allSectors, eventId }: EventAssignmentsTableProps) => {
  const { profile } = useAuthStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isMember = (profile as any)?.roles?.name === 'Membro';

  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(isMember ? 'open' : 'all');
  const [isDeleting, setIsDeleting] = useState(false);

  // Mapeamento de setor (nome) para cor - case-insensitive
  const sectorColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allSectors.forEach(sector => {
      // Mapeia tanto o nome original quanto lowercase para suportar ambos os sistemas
      map[sector.name] = sector.color || '#3B82F6';
      map[sector.name.toLowerCase()] = sector.color || '#3B82F6';
    });
    return map;
  }, [allSectors]);

  // Mapeamento de enum (lowercase) para nome (titlecase)
  const sectorEnumToName = useMemo(() => {
    const map: Record<string, string> = {};
    allSectors.forEach(sector => {
      map[sector.name.toLowerCase()] = sector.name;
    });
    return map;
  }, [allSectors]);

  const availableAssignments = useMemo(() => {
    if (isMember) {
      return assignments.filter(assignment => !assignment.members || assignment.members.id === profile?.id);
    }
    return assignments;
  }, [assignments, isMember, profile?.id]);


  const uniqueSectors = useMemo(() => {
    const sectors = new Set(availableAssignments.map(a => a.tasks?.sector).filter(Boolean));
    return ['all', ...Array.from(sectors)];
  }, [availableAssignments]);


  const filteredAssignments = useMemo(() => {
    return availableAssignments.filter(assignment => {
      const searchMatch = searchTerm.trim() === '' || assignment.tasks?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const sectorMatch = sectorFilter === 'all' || assignment.tasks?.sector === sectorFilter;
      if (!isMember) {
        const statusMatch = statusFilter === 'all' || (statusFilter === 'open' && !assignment.members) || (statusFilter === 'filled' && !!assignment.members);
        return searchMatch && sectorMatch && statusMatch;
      }
      return searchMatch && sectorMatch;
    });
  }, [availableAssignments, searchTerm, sectorFilter, statusFilter, isMember]);

  const handleDeleteAssignment = async (assignmentId: string) => {
    setIsDeleting(true);
    const result = await deleteAssignment(assignmentId, eventId);
    if (result.success) {
      toast.success(result.message, { position: 'top-center' });
    } else {
      toast.error(result.message, { position: 'top-center' });
    }
    setIsDeleting(false);
  };

  if (availableAssignments.length === 0 && isMember) {
    return (<div>Não há vagas em aberto no momento.</div>)
  }
  if (assignments?.length === 0) {
    return (
      !isMember && (
        <div className="mb-4">
          <AddAssignmentDialog
            eventId={eventId}
            allTasks={allTasks}
          />
        </div>
      )
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 border rounded-lg bg-card">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Buscar por tarefa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por setor" />
            </SelectTrigger>
            <SelectContent>
              {uniqueSectors.map(sector => {
                const sectorName = sector === 'all' ? 'Todos os Setores' : (sectorEnumToName[sector ?? ''] || sector);
                const sectorColor = sector !== 'all' ? sectorColorMap[sector ?? ''] : undefined;

                return (
                  <SelectItem key={sector} value={sector ?? 'all'}>
                    {sector !== 'all' && sectorColor ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sectorColor }}
                        />
                        {sectorName}
                      </div>
                    ) : (
                      sectorName
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {!isMember && (
            <>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="open">Vaga em Aberto</SelectItem>
                  <SelectItem value="filled">Vaga Preenchida</SelectItem>
                </SelectContent>
              </Select>

              <AddAssignmentDialog
                eventId={eventId}
                allTasks={allTasks}
              />
            </>
          )}
        </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.tasks?.name ?? 'Tarefa não encontrada'}</TableCell>
                <TableCell>
                  {assignment.tasks?.sector && (
                    <Badge
                      className="border-0"
                      style={{
                        backgroundColor: sectorColorMap[assignment.tasks.sector] ||
                                       sectorColorMap[assignment.tasks.sector.toLowerCase()] ||
                                       '#3B82F6',
                        color: '#ffffff'
                      }}
                    >
                      {sectorEnumToName[assignment.tasks.sector] || assignment.tasks.sector}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {assignment.members ?
                    assignment.members.name :
                    <Badge variant="outline">Vaga em aberto</Badge>
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!isMember ?
                      <>
                        <LeaderAssignment assignment={assignment} allMembers={allMembers.filter(member => member.sectors?.name.toLowerCase() === assignment.tasks?.sector)} />
                        <DeleteAssignment
                          assignmentName={assignment.tasks?.name ?? 'Tarefa não encontrada'}
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          isDeleting={isDeleting}
                        />
                      </>
                      :
                      <MemberAssignment assignment={assignment} />
                    }
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredAssignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default EventAssignmentTable;