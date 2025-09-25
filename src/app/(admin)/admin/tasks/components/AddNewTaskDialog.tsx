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

const AddNewTaskDialog = () => {
    const router = useRouter();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sector: 'geral' as Enums<'sector_enum'>,
        isDefault: 'false'
    });

    const resetForm = () => {
        setFormData({ name: '', description: ' ,', isDefault: 'false', sector: 'geral' });
        setIsSubmitting(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        // e.preventDefault();
        console.log(e, 'event')

        setIsSubmitting(true);

        const taskData: TablesInsert<'tasks'> = {
            name: formData.name,
            description: formData.description,
            is_default: formData.isDefault === 'true',
            sector: formData.sector as Enums<'sector_enum'>
        }

        const { error } = await supabase.from('tasks').insert([taskData]);

        if (error) {
            console.error('Erro ao adicionar tarefa:', error);
            // alert('Erro ao adicionar membro: ' + error.message);
            toast.error('Tivemos um problema ao adicionar a tarefa. Tente novamente mais tarde.', { position: 'top-center' });
            setIsSubmitting(false);
        } else {
            toast.success('Tarefa adicionada com sucesso!', { position: 'top-center' });
            resetForm();
            setIsOpen(false);
            router.refresh();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
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