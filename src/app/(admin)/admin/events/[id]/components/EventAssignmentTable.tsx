'use client'

import { Tables, TablesUpdate } from "@/libs/supabase/database.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/table";
import { Badge } from "../../../../../../components/ui/badge";
import { Button } from "../../../../../../components/ui/button";
import { Input } from "../../../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/select";
import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/libs/supabase/client";
import MemberAssignment from "./MemberAssignment";
import LeaderAssignment from "./LeaderAssignment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

type Task = Tables<'tasks'>;
type Member = Tables<'members'>;
export type Assignment = Tables<'event_assignments'> & {
  tasks: Task | null;
  members: Member | null; 
};

interface EventAssignmentsTableProps {
  assignments: Assignment[];
  allMembers: { id: string; name: string }[];
}

const EventAssignmentTable = ({ allMembers, assignments }: EventAssignmentsTableProps) => {
  const { profile } = useAuthStore();
  const isMember = profile?.role === 'membro';
  const supabase = createClient();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(isMember ? 'open' : 'all');
  const [isDeleting, setIsDeleting] = useState(false);

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
      const searchMatch = searchTerm.trim() === '' ||
        assignment.tasks?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const sectorMatch = sectorFilter === 'all' || assignment.tasks?.sector === sectorFilter;

      if (!isMember) {
        const statusMatch = statusFilter === 'all' ||
          (statusFilter === 'open' && !assignment.members) ||
          (statusFilter === 'filled' && !!assignment.members);
        return searchMatch && sectorMatch && statusMatch;
      }
      return searchMatch && sectorMatch;
    });
  }, [availableAssignments, searchTerm, sectorFilter, statusFilter, isMember]);

  const handleDeleteAssignment = async (assignmentId: string) => {
    setIsDeleting(true);
    const { error } = await supabase
      .from('event_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      toast.error('Tivemos um problema ao remover a tarefa. Tente novamente.', { position: 'top-center' });
    } else {
      toast.success('Tarefa removida do evento com sucesso!', { position: 'top-center' });
      router.refresh();
    }
    setIsDeleting(false);
  };

  if (availableAssignments.length === 0 && isMember) {
    return (<div>Não há vagas em aberto no momento.</div>)
  }
  if (assignments?.length === 0) {
    return (<div>Nenhuma tarefa atribuída para este evento.</div>)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 border rounded-lg bg-card">
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
            {uniqueSectors.map(sector => (
              <SelectItem key={sector} value={sector ?? 'all'}>
                {sector === 'all' ? 'Todos os Setores' : sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isMember && (
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
        )}
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
                  {assignment.tasks?.sector && <Badge>{assignment.tasks.sector}</Badge>}
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
                            <LeaderAssignment assignment={assignment} allMembers={allMembers}/>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="!max-w-xs">
                                <DialogHeader>
                                    <DialogTitle>Remover Tarefa?</DialogTitle>
                                    <DialogDescription>
                                    Tem certeza que deseja remover a tarefa &quot;{assignment.tasks?.name}&quot; deste evento? Esta ação não pode ser desfeita.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <div className="w-full flex justify-between pt-5">
                                    <DialogClose asChild>
                                        <Button variant='outline' type="button">
                                        Cancelar
                                        </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button 
                                            variant="destructive" 
                                            onClick={() => handleDeleteAssignment(assignment.id)}
                                            disabled={isDeleting}
                                        >
                                        {isDeleting ? 'Removendo...' : 'Remover'}
                                        </Button>
                                    </DialogClose>
                                    </div>
                                </DialogFooter>
                                </DialogContent>
                            </Dialog>
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