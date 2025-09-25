import AddNewMemberDialog from "@/app/(admin)/admin/members/components/AddNewMemberDialog"
import EditMemberDialog from "@/app/(admin)/admin/members/components/EditMemberDialog"
import { Badge } from "@/components/ui/badge"
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table"
import { createClient } from "@/libs/supabase/server"
import { formatDate, formatPhoneNumber } from "@/utils/format"
import { redirect } from "next/navigation"

const MembersPage = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Esta linha é uma salvaguarda, mas teoricamente nunca será alcançada
        return redirect('/admin/login')
    }

    const { data: profile } = await supabase.from('members').select('role').eq('user_id', user.id).single()

    // Define as roles que podem acessar esta página
    const allowedRoles: string[] = ['admin', 'pastor(a)']

    // Se o usuário não tem uma role ou a role dele não está na lista, redireciona
    if (!profile?.role || !allowedRoles.includes(profile.role)) {
        redirect('/admin/unauthorized')
    }

    // O resto da página só é executado se o usuário tiver permissão
    const { data: members } = await supabase.from('members').select('*')

    return (
        <>
            <section className="lg:max-w-4xl my-4 mx-auto w-full">
                <h1 className="text-3xl font-bold">Membros</h1>
            </section>
            <section className="lg:max-w-4xl mx-auto w-full">
                <div className="flex justify-end mb-4">
                    <AddNewMemberDialog />
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
                                <TableCell><EditMemberDialog member={member} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </>
    )
}

export default MembersPage