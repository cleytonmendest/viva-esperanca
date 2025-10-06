'use client'
import { FormConfig } from "@/components/forms/form-config";
import { GenericForm } from "@/components/forms/GenericForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TablesInsert } from "@/libs/supabase/database.types";
import { useState } from "react";
import { toast } from "sonner";
import { addEvent } from "../../lib/actions";

const eventFormConfig: FormConfig = [
    { name: 'name', label: 'Nome do Evento', type: 'text', placeholder: 'Digite o nome do evento', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Breve descrição do evento' },
    { name: 'event_date', label: 'Data e Hora do Evento', type: 'datetime-local', required: true },
];
interface EventFormData {
    name: string;
    description: string;
    event_date: string;
}

const AddNewEventDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: EventFormData) => {
        setIsSubmitting(true);

        const isoDate = new Date(data.event_date).toISOString();

        const eventData: TablesInsert<'events'> = {
            name: data.name,
            description: data.description,
            event_date: isoDate
        }

        const result = await addEvent(eventData);

        if (result.success) {
            toast.success(result.message, { position: 'top-center' });
            setIsOpen(false);
        } else {
            toast.error(result.message, { position: 'top-center' });
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
        }}>
            <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">
                    Adicionar Evento
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Evento</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para adicionar um novo evento.
                    </DialogDescription>
                </DialogHeader>
                <GenericForm
                    formConfig={eventFormConfig}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}

export default AddNewEventDialog