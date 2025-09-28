import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AddNewTaskDialog from './components/AddNewTaskDialog'
import { createClient } from '@/libs/supabase/server'
import EditNewTaskDialog from './components/EditNewTaskDialog'
import { redirect } from 'next/navigation'

const TaskPage = async () => {
    const supabase = await createClient()
    const { data: tasks } = await supabase.from('tasks').select('*')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Esta linha é uma salvaguarda, mas teoricamente nunca será alcançada
        return redirect('/admin/login')
    }

    return (
        <>
            <section className="lg:max-w-4xl my-4 mx-auto w-full">
                <h1 className="text-3xl font-bold">Tarefas</h1>
            </section>
            <section className="lg:max-w-4xl mx-auto w-full">
                <div className="flex justify-end mb-4">
                    <AddNewTaskDialog />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead>Editar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks && tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>{task.name}</TableCell>
                                <TableCell>
                                    {task.sector}
                                </TableCell>
                                <TableCell>
                                    <EditNewTaskDialog
                                        task={task}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </>
    )
}

export default TaskPage