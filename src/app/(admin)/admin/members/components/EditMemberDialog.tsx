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
    roles: Tables<'roles'>[]
    sectors: Tables<'sectors'>[]
}

const EditMemberDialog = ({ member, roles, sectors }: EditMemberDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { profile } = useAuthStore()
    const formRef = useRef<GenericFormRef>(null);

    const sectorOptions = sectors.map(sector => ({
        value: sector.id,
        label: sector.name
    }));

    const roleOptions = roles.map((role) => ({
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

    const defaultValues = {
        ...member,
        role_id: member.role_id || undefined,
        sector_id: member.sector_id || undefined,
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