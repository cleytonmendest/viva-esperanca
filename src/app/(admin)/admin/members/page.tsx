import AddNewMemberDialog from "@/components/layout/AddNewMemberDialog"
import EditMemberDialog from "@/components/layout/EditMemberDialog"
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table"
import { createClient } from "@/libs/supabase/server"
import { formatDate, formatPhoneNumber } from "@/utils/format"

const MembersPage = async () => {
    const supabase = await createClient()
    const members = await supabase.from('members').select('*')

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
                        {members.data?.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{member.sector ?? 'Sem setor'}</TableCell>
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