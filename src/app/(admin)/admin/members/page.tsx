import AddNewMemberDialog from "@/app/(admin)/admin/members/components/AddNewMemberDialog"
import EditMemberDialog from "@/app/(admin)/admin/members/components/EditMemberDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table"
import { getMembers, getPendingMembers } from "@/app/(admin)/admin/queries"
import { formatDate, formatPhoneNumber } from "@/lib/format"
import { getAllRoles, getAllSectors } from "@/lib/permissions"
import { UserCheck } from "lucide-react"
import Link from "next/link"

const MembersPage = async () => {
    const [members, roles, sectors, pendingMembers] = await Promise.all([
        getMembers(),
        getAllRoles(),
        getAllSectors(),
        getPendingMembers(),
    ]);

    return (
        <>
            <section className="lg:max-w-4xl my-4 mx-auto w-full">
                <h1 className="text-3xl font-bold">Membros</h1>
            </section>
            <section className="lg:max-w-4xl mx-auto w-full">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        {pendingMembers.length > 0 && (
                            <Link href="/admin/members/pending">
                                <Button variant="outline" className="border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/10 cursor-pointer">
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    {pendingMembers.length} {pendingMembers.length === 1 ? 'Membro Aguardando' : 'Membros Aguardando'} Aprovação
                                </Button>
                            </Link>
                        )}
                    </div>
                    <AddNewMemberDialog roles={roles} sectors={sectors} />
                </div>
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
                        {members && members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>
                                    {member.sector && member.sector.length > 0 ? member.sector.map((sector) => (
                                        <Badge key={sector} variant="default"
                                            className="mr-1 mb-1"
                                        >{sector}</Badge>
                                    )) : <span className="text-xs">Sem setor</span>}
                                </TableCell>
                                <TableCell>{formatPhoneNumber(member.phone)}</TableCell>
                                <TableCell>{formatDate(member.birthdate)}</TableCell>
                                <TableCell><EditMemberDialog member={member} roles={roles} sectors={sectors} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </>
    )
}

export default MembersPage