'use client'

import { Tables } from "@/libs/supabase/database.types";
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

type Task = Tables<'tasks'>;
type Member = Tables<'members'>;
export type Assignment = Tables<'event_assignments'> & {
  tasks: Task | null;
  members: Member | null; // A chave para saber se está atribuído
};

interface EventAssignmentsTableProps {
  assignments: Assignment[];
  allMembers: { id: string; name: string }[];
}

const EventAssignmentTable = ({ allMembers, assignments }: EventAssignmentsTableProps) => {
  const { profile } = useAuthStore();
  const isMember = profile?.role === 'membro';
  const supabase = createClient();

  // 1. FILTRAGEM INICIAL: Se for membro, pega apenas as vagas em aberto.
  const availableAssignments = useMemo(() => {
    if (isMember) {
      // Retorna uma nova lista contendo apenas assignments onde 'members' é null.
      return assignments.filter(assignment => !assignment.members || assignment.members.id === profile?.id);
    }
    // Se não for membro, usa a lista completa.
    return assignments;
  }, [assignments, isMember]);


  // Os estados dos filtros continuam aqui
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  // Se for membro, o filtro de status é irrelevante, mas mantemos para outros perfis.
  const [statusFilter, setStatusFilter] = useState(isMember ? 'open' : 'all');


  // Lógica para obter setores únicos para o dropdown de filtro
  const uniqueSectors = useMemo(() => {
    // Usa availableAssignments para que o membro só veja os setores das vagas disponíveis
    const sectors = new Set(availableAssignments.map(a => a.tasks?.sector).filter(Boolean));
    return ['all', ...Array.from(sectors)];
  }, [availableAssignments]);


  // 2. LÓGICA DE FILTRAGEM APLICADA SOBRE A LISTA JÁ PRÉ-FILTRADA
  const filteredAssignments = useMemo(() => {
    return availableAssignments.filter(assignment => {
      // Filtro por termo de busca
      const searchMatch = searchTerm.trim() === '' ||
        assignment.tasks?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por setor
      const sectorMatch = sectorFilter === 'all' || assignment.tasks?.sector === sectorFilter;

      // Filtro por status (relevante apenas para não-membros)
      if (!isMember) {
        const statusMatch = statusFilter === 'all' ||
          (statusFilter === 'open' && !assignment.members) ||
          (statusFilter === 'filled' && !!assignment.members);
        return searchMatch && sectorMatch && statusMatch;
      }

      // Para membros, o status já foi filtrado, então ignoramos essa verificação
      return searchMatch && sectorMatch;
    });
  }, [availableAssignments, searchTerm, sectorFilter, statusFilter, isMember]);

  if (availableAssignments.length === 0 && isMember) {
    return (<div>Não há vagas em aberto no momento.</div>)
  }
  if (assignments?.length === 0) {
    return (<div>Nenhuma tarefa atribuída para este evento.</div>)
  }

  return (
    <div>
      {/* 3. UI DOS FILTROS */}
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

        {/* O filtro de status só aparece se NÃO for membro */}
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

                {/* 4. CÉLULA SIMPLIFICADA: Se chegou aqui, a vaga está aberta */}
                <TableCell>
                  {assignment.members ?
                    assignment.members.name :
                    <Badge variant="outline">Vaga em aberto</Badge>
                  }
                </TableCell>
                <TableCell>
                  {!isMember ?
                    <LeaderAssignment assignment={assignment} allMembers={allMembers}/>
                    :
                    <MemberAssignment assignment={assignment} />
                  }
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