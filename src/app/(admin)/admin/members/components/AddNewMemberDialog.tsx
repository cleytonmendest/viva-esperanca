'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../components/ui/dialog"
import { createClient } from "@/libs/supabase/client"
import type { TablesInsert, Enums } from "@/libs/supabase/database.types"
import { Constants } from "@/libs/supabase/database.types"
import { unmaskPhoneNumber } from "@/utils/format"
import { toast } from "sonner"
import { GenericForm } from "../../../../../components/forms/GenericForm"
import { FormConfig } from "../../../../../components/forms/form-config"

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

interface MemberFormData {
    name: string;
    phone: string;
    birthdate: string;
    sector: string[];
    role?: string;
}

const AddNewMemberDialog = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const resetForm = () => {
        setIsSubmitting(false);
    }

    const handleSubmit = async (member: MemberFormData) => {

        setIsSubmitting(true);
        const cleanedPhone = unmaskPhoneNumber(member.phone);

        const memberData: TablesInsert<'members'> = {
            name: member.name,
            phone: cleanedPhone,
            birthdate: member.birthdate,
            sector: member.sector.length > 0 ? member.sector as Enums<'sector_enum'>[] : null,
        }

        const { error } = await supabase.from('members').insert([memberData]);

        if (error) {
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

