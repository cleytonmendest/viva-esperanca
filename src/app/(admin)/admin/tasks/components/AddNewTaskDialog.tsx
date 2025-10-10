'use client'
import { FormConfig } from "@/components/forms/form-config";
import { GenericForm } from "@/components/forms/GenericForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Constants, Enums, TablesInsert } from "@/lib/supabase/database.types";
import { useState } from "react";
import { toast } from "sonner";
import { addTask } from "../../actions";

const memberFormConfig: FormConfig = [
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Digite o nome da tarefa', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Breve descrição da tarefa' },
    { name: 'is_default', label: 'Tarefa padrão?', type: 'radio', options: [{ value: 'true', label: 'Sim' }, { value: 'false', label: 'Não' }] },
    { name: 'quantity', label: 'Quantidade', type: 'number', placeholder: '1', required: true },
    {
        name: 'sector',
        label: 'Setor',
        type: 'select',
        placeholder: 'Selecione...',
        options: Constants.public.Enums.sector_enum.map(sector => ({
            value: sector,
            label: sector.charAt(0).toUpperCase() + sector.slice(1)
        })),
        required: true
    }
];
interface TaskFormData {
    name: string;
    description: string;
    is_default: string;
    sector: Enums<'sector_enum'>;
    quantity: number;
}

const AddNewTaskDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: TaskFormData) => {
        setIsSubmitting(true);

        const taskData: TablesInsert<'tasks'> = {
            name: data.name,
            description: data.description,
            is_default: data.is_default === 'true',
            sector: data.sector,
            quantity: Number(data.quantity)
        }

        const result = await addTask(taskData);

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
                    Adicionar Tarefa
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Tarefa</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para adicionar um nova tarefa.
                    </DialogDescription>
                </DialogHeader>
                <GenericForm
                    formConfig={memberFormConfig}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}

export default AddNewTaskDialog