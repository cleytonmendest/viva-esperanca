'use client'

import { Pencil } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Constants, Tables, TablesUpdate } from "@/lib/supabase/database.types"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { unmaskPhoneNumber } from "@/lib/format"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/authStore"
import { updateMember } from "../../actions"
import { GenericForm, GenericFormRef } from "@/components/forms/GenericForm"
import { FormConfig } from "@/components/forms/form-config"

type EditMemberDialogProps = {
    member: Tables<'members'>
}

const EditMemberDialog = ({ member }: EditMemberDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { profile } = useAuthStore()
    const formRef = useRef<GenericFormRef>(null);

    const sectorOptions = Constants.public.Enums.sector_enum.map(sector => ({
        value: sector,
        label: sector.charAt(0).toUpperCase() + sector.slice(1)
    }));

    const roleOptions = Constants.public.Enums.user_role_enum.map((role: string) => ({
        value: role,
        label: role.charAt(0).toUpperCase() + role.slice(1)
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
            name: "sector",
            label: "Setor",
            type: "multiselect",
            options: sectorOptions,
            placeholder: "Selecione...",
        },
    ];

    if (profile?.role === 'admin') {
        formConfig.push({
            name: "role",
            label: "Role",
            type: "select",
            options: roleOptions,
            placeholder: "Selecione uma opção",
        });
    }

    const defaultValues = {
        ...member,
        sector: member.sector ?? [],
    };

    const handleSubmit = async (data: TablesUpdate<'members'>) => {
        setIsSubmitting(true);
        const cleanedPhone = data.phone ? unmaskPhoneNumber(data.phone) : '';

        const memberData: TablesUpdate<'members'> = {
            ...data,
            phone: cleanedPhone,
        };

        const result = await updateMember(member.id, memberData);

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

    if (member.user_id && profile?.role !== 'admin') return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="cursor-pointer" asChild>
                <Button variant="default" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Membro</DialogTitle>
                    <DialogDescription>
                        Altere as informações do membro aqui.
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

export default EditMemberDialog;