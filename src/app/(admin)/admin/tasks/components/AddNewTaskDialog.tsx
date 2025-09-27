'use client'
import { FormConfig } from "@/components/forms/form-config";
import { GenericForm } from "@/components/forms/GenericForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/libs/supabase/client";
import { Constants, Enums, Tables, TablesInsert } from "@/libs/supabase/database.types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const memberFormConfig: FormConfig = [
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Digite o nome da tarefa', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Breve descrição da tarefa' },
    { name: 'is_default', label: 'Tarefa padrão?', type: 'radio', options: [{ value: 'true', label: 'Sim' }, { value: 'false', label: 'Não' }] },
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
}

const AddNewTaskDialog = () => {
    const router = useRouter();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: TaskFormData) => {
        setIsSubmitting(true);

        const taskData: TablesInsert<'tasks'> = {
            name: data.name,
            description: data.description,
            is_default: data.is_default === 'true',
            sector: data.sector
        }

        const { error } = await supabase.from('tasks').insert([taskData]);

        if (error) {
            console.error('Erro ao adicionar tarefa:', error);
            // alert('Erro ao adicionar membro: ' + error.message);
            toast.error('Tivemos um problema ao adicionar a tarefa. Tente novamente mais tarde.', { position: 'top-center' });
        } else {
            toast.success('Tarefa adicionada com sucesso!', { position: 'top-center' });
            setIsOpen(false);
            router.refresh();
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