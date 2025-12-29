'use client'

import { useState } from "react"
import { Button } from "../../../../../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../components/ui/dialog"
import type { TablesInsert, Tables } from "@/lib/supabase/database.types"
import { unmaskPhoneNumber } from "@/lib/format"
import { toast } from "sonner"
import { GenericForm } from "../../../../../components/forms/GenericForm"
import { FormConfig } from "../../../../../components/forms/form-config"
import { addMember } from "../../actions"
import { useAuthStore } from "@/stores/authStore"

interface MemberFormData {
    name: string;
    phone: string;
    birthdate: string;
    sector_id?: string;
    role_id?: string;
}

interface AddNewMemberDialogProps {
    roles: Tables<'roles'>[]
    sectors: Tables<'sectors'>[]
}

const AddNewMemberDialog = ({ roles, sectors }: AddNewMemberDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { profile } = useAuthStore();

    const sectorOptions = sectors.map(sector => ({
        value: sector.id,
        label: sector.name
    }));

    const roleOptions = roles.map(role => ({
        value: role.id,
        label: role.name
    }));

    const formConfig: FormConfig = [
        {
            name: "name",
            label: "Nome",
            type: "text",
            placeholder: "Digite o nome do membro",
            required: true,
        },
        {
            name: "phone",
            label: "Telefone",
            type: "tel",
            placeholder: "(21) 99999-9999",
            required: true,
        },
        {
            name: "birthdate",
            label: "Data de Nascimento",
            type: "date",
            required: true,
        },
        {
            name: "sector_id",
            label: "Setor",
            type: "select",
            options: sectorOptions,
            placeholder: "Selecione...",
        },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((profile as any)?.roles?.name === 'Admin') {
        formConfig.push({
            name: "role_id",
            label: "Role",
            type: "select",
            options: roleOptions,
            placeholder: "Selecione uma opção",
        });
    }

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
            sector_id: member.sector_id || null,
            role_id: member.role_id || null,
        }

        const result = await addMember(memberData);

        if (result.success) {
            toast.success(result.message, { position: 'top-center' });
            resetForm();
            setIsOpen(false);
        } else {
            toast.error(result.message, { position: 'top-center' });
            setIsSubmitting(false);
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
                    formConfig={formConfig}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}

export default AddNewMemberDialog;

