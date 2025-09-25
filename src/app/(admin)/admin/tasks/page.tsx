import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AddNewTaskDialog from './components/AddNewTaskDialog'

const TaskPage = () => {
    


    return (
        <>
            <section className="lg:max-w-4xl my-4 mx-auto w-full">
                <h1 className="text-3xl font-bold">Tarefas</h1>
            </section>
            <section className="lg:max-w-4xl mx-auto w-full">
                <div className="flex justify-end mb-4">
                    <AddNewTaskDialog />
                </div>
                {/* <Table>
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
                </Table> */}
            </section>
        </>
    )
}

export default TaskPage