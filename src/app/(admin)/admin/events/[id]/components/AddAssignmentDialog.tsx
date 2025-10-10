'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Combobox } from "@/components/Combobox";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { addAssignmentToEvent } from "../../../actions";

interface AddAssignmentDialogProps {
    eventId: string;
    allTasks: { id: string; name: string }[];
}

const AddAssignmentDialog = ({ eventId, allTasks }: AddAssignmentDialogProps) => {
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

        const result = await addAssignmentToEvent(eventId, selectedTaskId);

        if (result.success) {
            toast.success(result.message, { position: 'top-center' });
            setSelectedTaskId('');
            setIsOpen(false);
        } else {
            toast.error(result.message, { position: 'top-center' });
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