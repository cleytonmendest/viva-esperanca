'use client'

import { FormConfig } from "@/components/forms/form-config";
import { GenericForm } from "@/components/forms/GenericForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/libs/supabase/client";
import { Tables, TablesUpdate } from "@/libs/supabase/database.types";
import { EllipsisVertical } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const taskFormConfig: FormConfig = [
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Digite o nome da tarefa', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Breve descrição da tarefa' },
    // Alterado de 'date' para 'datetime-local'
    { name: 'event_date', label: 'Data e Hora do Evento', type: 'datetime-local', required: true }
];

interface EventData {
    event: Tables<'events'>
}

interface EventFormData {
    name: string;
    description: string;
    event_date: string;
}

const EditNewEventDialog = ({ event }: EventData) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (data: EventFormData) => {
        setIsSubmitting(true);

        const taskData: TablesUpdate<'events'> = {
            name: data.name,
            description: data.description,
            event_date: data.event_date
        };

        const { error } = await supabase
            .from('events')
            .update(taskData)
            .eq('id', event.id);

        if (error) {
            console.error('Erro ao atualizar tarefa:', error);
            toast.error('Tivemos um problema ao atualizar a tarefa. Tente novamente mais tarde.', { position: 'top-center' });
        } else {
            toast.success('Tarefa editada com sucesso!', { position: 'top-center' });
            setIsOpen(false);
            router.refresh();
        }
        setIsSubmitting(false);
    };

    const defaultValues = {
        name: event.name,
        description: event.description,
        event_date: event.event_date,
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger className="cursor-pointer">
                <EllipsisVertical size={16} />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Tarefa</DialogTitle>
                    <DialogDescription>
                        Altere as informações da tarefa aqui.
                    </DialogDescription>
                </DialogHeader>
                <GenericForm
                    formConfig={taskFormConfig}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                    defaultValues={defaultValues}
                />
            </DialogContent>
        </Dialog>
    )
}

export default EditNewEventDialog