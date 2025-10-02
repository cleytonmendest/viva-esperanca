'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Combobox } from "@/components/Combobox";
import { createClient } from "@/libs/supabase/client";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AddAssignmentDialogProps {
    eventId: string;
    allTasks: { id: string; name: string }[];
}

const AddAssignmentDialog = ({ eventId, allTasks }: AddAssignmentDialogProps) => {
    const router = useRouter();
    const supabase = createClient();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableTasksToAdd = allTasks.map(task => ({ value: task.id, label: task.name }));

    const handleAddTask = async () => {
        if (!selectedTaskId) {
            toast.error('Por favor, selecione uma tarefa.');
            return;
        }
        setIsSubmitting(true);

        const { error } = await supabase
            .from('event_assignments')
            .insert({
                event_id: eventId,
                task_id: selectedTaskId,
            });

        if (error) {
            toast.error('Tivemos um problema ao adicionar a tarefa. Tente novamente.', { position: 'top-center' });
        } else {
            toast.success('Tarefa adicionada ao evento com sucesso!', { position: 'top-center' });
            setSelectedTaskId('');
            setIsOpen(false);
            router.refresh();
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Tarefa
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-xs">
                <DialogHeader>
                    <DialogTitle>Adicionar Tarefa ao Evento</DialogTitle>
                    <DialogDescription>
                        Selecione uma tarefa da lista para adicionar à escala deste evento.
                    </DialogDescription>
                </DialogHeader>
                <Combobox
                    options={availableTasksToAdd}
                    value={selectedTaskId}
                    onChange={setSelectedTaskId}
                    placeholder="Selecione uma tarefa..."
                    empty="Nenhuma tarefa disponível."
                />
                <DialogFooter>
                    <div className="w-full flex justify-between pt-5">
                        <DialogClose asChild><Button variant='outline' type="button">Cancelar</Button></DialogClose>
                        <Button onClick={handleAddTask} disabled={isSubmitting}>
                            {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddAssignmentDialog;