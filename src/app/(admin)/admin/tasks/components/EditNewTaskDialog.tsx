'use client'

import { FormConfig } from "@/components/forms/form-config";
import { GenericForm } from "@/components/forms/GenericForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/libs/supabase/client";
import { Constants, Enums, Tables, TablesUpdate } from "@/libs/supabase/database.types";
import { EllipsisVertical } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const taskFormConfig: FormConfig = [
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

interface TaskData {
    task: Tables<'tasks'>
}

interface TaskFormData {
    name: string;
    description: string;
    is_default: string;
    sector: Enums<'sector_enum'>;
    quantity: number;
}

const EditNewTaskDialog = ({ task }: TaskData) => {
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

    const handleSubmit = async (data: TaskFormData) => {
        setIsSubmitting(true);

        const taskData: TablesUpdate<'tasks'> = {
            name: data.name,
            description: data.description,
            is_default: data.is_default === 'true',
            sector: data.sector,
            quantity: Number(data.quantity)
        };

        const { error } = await supabase
            .from('tasks')
            .update(taskData)
            .eq('id', task.id);

        if (error) {
            console.error('Erro ao atualizar tarefa:', error);
            toast.error('Tivemos um problema ao atualizar a tarefa. Tente novamente mais tarde.', { position: 'top-center' });
            // alert('Erro ao atualizar tarefa: ' + error.message);
        } else {
            // alert('Tarefa atualizada com sucesso!');
            toast.success('Tarefa editada com sucesso!', { position: 'top-center' });
            setIsOpen(false);
            router.refresh();
        }
        setIsSubmitting(false);
    };

    const defaultValues = {
        name: task.name,
        description: task.description,
        is_default: task.is_default ? 'true' : 'false',
        sector: task.sector,
        quantity: task.quantity
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

export default EditNewTaskDialog