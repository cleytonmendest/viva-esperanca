import { getPendingMembers } from "@/app/(admin)/admin/queries"
import { getAllRoles } from "@/lib/permissions"
import { formatDate, formatPhoneNumber } from "@/lib/format"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import ApproveMemberDialog from "./components/ApproveMemberDialog"
import DenyMemberDialog from "./components/DenyMemberDialog"

const PendingMembersPage = async () => {
  const [pendingMembers, roles] = await Promise.all([
    getPendingMembers(),
    getAllRoles()
  ]);

  // Filtrar apenas roles que não sejam "Pendente"
  const availableRoles = roles.filter(role => role.name !== 'Pendente');

  return (
    <>
      <section className="lg:max-w-5xl my-4 mx-auto w-full">
        <h1 className="text-3xl font-bold">Membros Aguardando Aprovação</h1>
        <p className="text-sm text-gray-400 mt-2">
          Aprove ou negue novos membros que se cadastraram no sistema
        </p>
      </section>

      <section className="lg:max-w-5xl mx-auto w-full">
        {pendingMembers.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-gray-400">Nenhum membro aguardando aprovação</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Nascimento</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{formatPhoneNumber(member.phone)}</TableCell>
                  <TableCell>{formatDate(member.birthdate)}</TableCell>
                  <TableCell>{formatDate(member.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      Pendente
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <ApproveMemberDialog member={member} roles={availableRoles} />
                      <DenyMemberDialog member={member} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </>
  )
}

export default PendingMembersPage
