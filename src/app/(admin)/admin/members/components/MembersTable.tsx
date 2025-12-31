'use client'

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatPhoneNumber } from "@/lib/format"
import EditMemberDialog from "./EditMemberDialog"
import { Search } from "lucide-react"
import { Tables } from "@/lib/supabase/database.types"

type Member = Tables<'members'>
type Role = Tables<'roles'>
type Sector = Tables<'sectors'>

interface MembersTableProps {
  members: Member[]
  roles: Role[]
  sectors: Sector[]
}

const MembersTable = ({ members, roles, sectors }: MembersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtro de membros baseado na busca
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members

    const search = searchTerm.toLowerCase().trim()
    console.log('🔍 Buscando por:', search)

    const filtered = members.filter((member) => {
      // Busca por nome
      const matchName = member.name?.toLowerCase().includes(search) || false

      // Busca por telefone (com ou sem formatação)
      const cleanSearch = search.replace(/\D/g, '')
      const matchPhone = cleanSearch ? member.phone?.includes(cleanSearch) : false

      // Busca por setor (sistema antigo - array)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldSectors = (member as any).sector || []
      const matchOldSector = oldSectors.some((s: string) =>
        s?.toLowerCase().includes(search)
      )

      // Busca por setor (sistema novo - FK)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newSector = (member as any).sectors
      const matchNewSector = newSector?.name?.toLowerCase().includes(search) || false

      const isMatch = matchName || matchPhone || matchOldSector || matchNewSector

      if (isMatch) {
        console.log('✅ Match:', member.name, { matchName, matchPhone, matchOldSector, matchNewSector })
      }

      return isMatch
    })

    console.log('📊 Resultados:', filtered.length, 'de', members.length)
    return filtered
  }, [members, searchTerm])

  return (
    <>
      {/* Campo de Busca */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome, telefone ou setor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-400 mt-2">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'membro encontrado' : 'membros encontrados'}
          </p>
        )}
      </div>

      {/* Tabela */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Nascimento</TableHead>
            <TableHead>Editar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                {searchTerm ? "Nenhum membro encontrado" : "Nenhum membro cadastrado"}
              </TableCell>
            </TableRow>
          ) : (
            filteredMembers.map((member) => {
              // Fallback: usa sistema novo (sectors table - FK única) ou antigo (sector enum array)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const newSector = (member as any).sectors; // Sistema novo: objeto único ou null
              const oldSectors = member.sector; // Sistema antigo: array de strings ou null

              // Sistema novo tem prioridade (se sector_id estiver preenchido)
              const memberSectors = newSector
                ? [newSector] // Converte objeto único em array para mapeamento
                : (oldSectors && oldSectors.length > 0 ? oldSectors : []);

              return (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    {memberSectors.length > 0 ? memberSectors.map((sector: any) => (
                      <Badge
                        key={sector.id || sector}
                        variant="default"
                        className="mr-1 mb-1"
                      >
                        {sector.name || sector}
                      </Badge>
                    )) : <span className="text-xs">Sem setor</span>}
                  </TableCell>
                  <TableCell>{formatPhoneNumber(member.phone)}</TableCell>
                  <TableCell>{formatDate(member.birthdate)}</TableCell>
                  <TableCell><EditMemberDialog member={member} roles={roles} sectors={sectors} /></TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  )
}

export default MembersTable
