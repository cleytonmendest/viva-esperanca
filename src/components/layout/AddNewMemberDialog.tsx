'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { createClient } from "@/libs/supabase/client"
import type { TablesInsert, Enums } from "@/libs/supabase/database.types"
import { Constants } from "@/libs/supabase/database.types"
import { isPhoneNumberValid, unmaskPhoneNumber } from "@/utils/format"
import { toast } from "sonner"
import { GenericForm } from "../forms/GenericForm"
import { FormConfig } from "../forms/form-config"

const memberFormConfig: FormConfig = [
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Digite o nome do membro', required: true },
    { name: 'phone', label: 'Telefone', type: 'tel', placeholder: '(21) 99999-9999', required: true },
    { name: 'birthdate', label: 'Data de Nascimento', type: 'date', required: true },
    {
        name: 'sector',
        label: 'Setor',
        type: 'multiselect',
        placeholder: 'Selecione...',
        options: Constants.public.Enums.sector_enum.map(sector => ({
            value: sector,
            label: sector.charAt(0).toUpperCase() + sector.slice(1)
        }))
    }
];

const AddNewMemberDialog = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        birthdate: '',
        sector: [] as string[]
    });
    const [phoneError, setPhoneError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const resetForm = () => {
        setFormData({ name: '', phone: '', birthdate: '', sector: [] });
        setPhoneError('');
        setIsSubmitting(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Checagem final de validação
        if (phoneError || !isPhoneNumberValid(formData.phone)) {
            setPhoneError('Por favor, insira um telefone válido com 11 dígitos.');
            return;
        }

        setIsSubmitting(true);
        const cleanedPhone = unmaskPhoneNumber(formData.phone);

        const memberData: TablesInsert<'members'> = {
            name: formData.name,
            phone: cleanedPhone,
            birthdate: formData.birthdate,
            sector: formData.sector.length > 0 ? formData.sector as Enums<'sector_enum'>[] : null,
        }

        const { error } = await supabase.from('members').insert([memberData]);

        if (error) {
            console.error('Erro ao adicionar membro:', error);
            // alert('Erro ao adicionar membro: ' + error.message);
            toast.error('Tivemos um problema ao adicionar o membro. Tente novamente mais tarde.', { position: 'top-center' });
            setIsSubmitting(false);
        } else {
            toast.success('Membro adicionado com sucesso!', { position: 'top-center' });
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
                    Adicionar Membro
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Membro</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para adicionar um novo membro.
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

export default AddNewMemberDialog;

