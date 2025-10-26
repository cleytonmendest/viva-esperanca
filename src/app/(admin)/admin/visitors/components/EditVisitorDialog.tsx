
'use client'

import { Pencil } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tables, TablesUpdate } from "@/lib/supabase/database.types"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { unmaskPhoneNumber } from "@/lib/format"
import { toast } from "sonner"
import { updateVisitor } from "../../actions"
import { GenericForm, GenericFormRef } from "@/components/forms/GenericForm"
import { FormConfig } from "@/components/forms/form-config"

type EditVisitorDialogProps = {
    visitor: Tables<'visitors'>
}

const EditVisitorDialog = ({ visitor }: EditVisitorDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const formRef = useRef<GenericFormRef>(null);

    const formConfig: FormConfig = [
        {
            name: "visitor_name",
            label: "Nome",
            type: "text",
            placeholder: "Digite o nome do visitante",
            required: true,
        },
        {
            name: "visitor_whatsapp",
            label: "Telefone",
            type: "tel",
            placeholder: "(21) 99999-9999",
            required: true,
        },
        {
            name: "visite_date",
            label: "Data da Visita",
            type: "date",
            required: true,
        },
        {
            name: "event_name",
            label: "Evento",
            type: "text",
            placeholder: "Digite o nome do evento",
        },
    ];

    const defaultValues = {
        ...visitor,
    };

    const handleSubmit = async (data: TablesUpdate<'visitors'>) => {
        setIsSubmitting(true);
        const cleanedPhone = data.visitor_whatsapp ? unmaskPhoneNumber(data.visitor_whatsapp) : '';

        const visitorData: TablesUpdate<'visitors'> = {
            ...data,
            visitor_whatsapp: cleanedPhone,
        };

        const result = await updateVisitor(visitor.id, visitorData);

        if (result.success) {
            toast.success(result.message, { position: 'top-center' });
            setIsOpen(false);
        } else {
            toast.error(result.message, { position: 'top-center' });
        }
        setIsSubmitting(false);
    };

    const handleSave = () => {
        formRef.current?.submit();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="cursor-pointer" asChild>
                <Button variant="default" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Visitante</DialogTitle>
                    <DialogDescription>
                        Altere as informações do visitante aqui.
                    </DialogDescription>
                </DialogHeader>
                <GenericForm
                    ref={formRef}
                    formConfig={formConfig}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                    defaultValues={defaultValues}
                    showSubmitButton={false}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditVisitorDialog;
