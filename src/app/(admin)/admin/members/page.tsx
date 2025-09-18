import AddNewMemberDialog from "@/components/layout/AddNewMemberDialog"
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table"
import { createClient } from "@/libs/supabase/server"
import { formatDate } from "@/utils/date"

const MembersPage = async () => {
    const supabase = await createClient()
    const members = await supabase.from('members').select('*')

    return (
        <>
            <section>
                <h1>Membros</h1>
            </section>
            <section className="lg:max-w-4xl mx-auto w-full">
                <div className="flex justify-end">
                    <AddNewMemberDialog />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Nascimento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.data?.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{member.sector ?? 'Sem setor'}</TableCell>
                                <TableCell>{member.phone}</TableCell>
                                <TableCell>{formatDate(member.birthdate)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </>
    )
}

export default MembersPage