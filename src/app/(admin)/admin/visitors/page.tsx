import AddNewVisitorDialog from "@/app/(admin)/admin/visitors/components/AddNewVisitorDialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatPhoneNumber } from "@/lib/format"
import EditVisitorDialog from "./components/EditVisitorDialog"
import DeleteVisitorDialog from "./components/DeleteVisitorDialog"

const VisitorsPage = async () => {
    const supabase = await createClient()
    const { data: visitors } = await supabase.from('visitors').select('*')
    const { data: members } = await supabase.from('members').select('*')

    return (
        <>
            <section className="lg:max-w-4xl my-4 mx-auto w-full">
                <h1 className="text-3xl font-bold">Visitantes</h1>
            </section>
            <section className="lg:max-w-4xl mx-auto w-full">
                <div className="flex justify-end mb-4">
                    {members && members.length > 0 && <AddNewVisitorDialog members={members}/>}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Data da Visita</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visitors && visitors.map((visitor) => (
                            <TableRow key={visitor.id}>
                                <TableCell>{visitor.visitor_name}</TableCell>
                                <TableCell>{formatPhoneNumber(visitor.visitor_whatsapp)}</TableCell>
                                <TableCell>{formatDate(visitor.visite_date)}</TableCell>
                                <TableCell>{visitor.event_name}</TableCell>
                                <TableCell className="flex gap-2">
                                    <EditVisitorDialog visitor={visitor} />
                                    <DeleteVisitorDialog visitorId={visitor.id} visitorName={visitor.visitor_name} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </>
    )
}

export default VisitorsPage