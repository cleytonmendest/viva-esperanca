'use client'

import { FormConfig } from "@/components/forms/form-config";
import { GenericForm } from "@/components/forms/GenericForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tables, TablesUpdate } from "@/lib/supabase/database.types";
import { Pencil } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";
import { updateEvent } from "../../actions";

const taskFormConfig: FormConfig = [
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Digite o nome da tarefa', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Breve descrição da tarefa' },
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

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (data: EventFormData) => {
        setIsSubmitting(true);

        const isoDate = new Date(data.event_date).toISOString();

        const eventData: TablesUpdate<'events'> = {
            name: data.name,
            description: data.description,
            event_date: isoDate
        };

        const result = await updateEvent(event.id, eventData);

        if (result.success) {
            toast.success(result.message, { position: 'top-center' });
            setIsOpen(false);
        } else {
            toast.error(result.message, { position: 'top-center' });
        }
        setIsSubmitting(false);
    };

    const date = new Date(event.event_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;

    const defaultValues = {
        name: event.name,
        description: event.description,
        event_date: localDateTimeString,
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger className="cursor-pointer" asChild>
                <Button variant="default" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
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