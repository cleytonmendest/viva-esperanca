'use client'

import { useState, useRef } from "react"
import { Button } from "../../../../../components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../components/ui/dialog"
import type { Tables, TablesInsert, Enums } from "@/lib/supabase/database.types"
import { unmaskPhoneNumber } from "@/lib/format"
import { toast } from "sonner"
import { addVisitor } from "../../actions"
import { GenericForm, GenericFormRef } from "@/components/forms/GenericForm"
import { FormConfig } from "@/components/forms/form-config"

type AddVisitorProps = {
    members: Tables<'members'>[]
}

type VisitorFormData = {
    name: string;
    first_time: string;
    visit_date: string;
    phone: string;
    invited_by: string;
    visitor_status: string;
    event_name: string;
};

const AddNewVisitorDialog = ({ members }: AddVisitorProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const formRef = useRef<GenericFormRef>(null);

    const visitorStatusOptions = [
        { value: "sem_igreja", label: "Sem Igreja" },
        { value: "visitante_outra_igreja", label: "Membro de outra Igreja" },
        { value: "afastado", label: "Afastado" },
        { value: "pendente", label: "Indeciso" },
    ];

    const firstTimeOptions = [
        { value: "true", label: "Sim" },
        { value: "false", label: "Não" },
    ];

    const memberOptions = members.map(member => ({ value: member.id, label: member.name }));

    const visitorFormConfig: FormConfig = [
        {
            name: "name",
            label: "Nome: *",
            type: "text",
            placeholder: "Digite o nome do visitante",
            required: true,
        },
        {
            name: "first_time",
            label: "Primeira visita? *",
            type: "radio",
            options: firstTimeOptions,
        },
        {
            name: "visit_date",
            label: "Data da Visita: *",
            type: "date",
            required: true,
        },
        {
            name: "phone",
            label: "Telefone: *",
            type: "tel",
            placeholder: "(21) 99999-9999",
            required: true,
        },
        {
            name: "invited_by",
            label: "Convidado por:",
            type: "combobox",
            options: memberOptions,
            placeholder: "Selecione...",
            empty: "Nenhum membro encontrado",
        },
        {
            name: "visitor_status",
            label: "Situação do Visitante: *",
            type: "select",
            options: visitorStatusOptions,
            placeholder: "Selecione uma opção",
            required: true,
        },
    ];

    const defaultValues = {
        name: '',
        phone: '',
        visit_date: '',
        event_name: '',
        invited_by: '',
        first_time: 'true',
        visitor_status: "sem_igreja"
    };

    const handleSubmit = async (data: VisitorFormData) => {
        setIsSubmitting(true);

        const cleanedPhone = data.phone ? unmaskPhoneNumber(data.phone) : '';

        const visitorData: TablesInsert<'visitors'> = {
            visitor_name: data.name,
            visitor_whatsapp: cleanedPhone,
            visite_date: data.visit_date,
            event_name: data.event_name, // This field is not in the form, it will be empty
            first_time: data.first_time === 'true',
            invited_by: data.invited_by || null,
            visitor_status: data.visitor_status as Enums<'visitor_status_enum'>
        }

        const result = await addVisitor(visitorData);

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
            <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">
                    Adicionar Visitante
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Visitantes</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para adicionar um novo visitante.
                    </DialogDescription>
                </DialogHeader>
                <GenericForm
                    ref={formRef}
                    formConfig={visitorFormConfig}
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
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewVisitorDialog;
