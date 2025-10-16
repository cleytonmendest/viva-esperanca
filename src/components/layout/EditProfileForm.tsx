'use client';

// import { Button } from "@/components/ui/button";
// import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { GenericForm } from "@/components/forms/GenericForm";
import { FormConfig } from "@/components/forms/form-config";
import { format, parseISO } from 'date-fns';
import { useState } from "react";
import { TablesUpdate } from "@/lib/supabase/database.types";
import { updateMember } from "@/app/(admin)/admin/actions";
import { toast } from "sonner";
import { unmaskPhoneNumber } from "@/lib/format";

const editProfileFormConfig: FormConfig = [
    {
        name: "name",
        label: "Nome",
        type: "text",
        placeholder: "Nome",
        required: true,
    },
    {
        name: "phone",
        label: "Telefone",
        type: "tel",
        placeholder: "Telefone",
        required: true,
    },
    {
        name: "birthdate",
        label: "Data de Nascimento",
        type: "date",
        required: true,
    },
];

export const EditProfileForm = () => {
    const { profile } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = profile ? {
        ...profile,
        birthdate: profile.birthdate ? format(parseISO(profile.birthdate), 'yyyy-MM-dd') : '',
    } : {};

    const handleSubmit = async (data: TablesUpdate<'members'>) => {
        if (!profile) return;

        setIsSubmitting(true);

        const cleanedData = {
            ...data,
            phone: data.phone ? unmaskPhoneNumber(data.phone) : '',
        };

        const result = await updateMember(profile.id, cleanedData);

        if (result.success) {
            toast.success(result.message, { position: 'top-center' });
            // Re-initializing the store is tricky without a dedicated function.
            // Reloading the page is a simple way to force a re-fetch of the user profile.
            window.location.reload();
        } else {
            toast.error(result.message, { position: 'top-center' });
        }

        setIsSubmitting(false);
    };


    return (
        <>
            <GenericForm
                formConfig={editProfileFormConfig}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                defaultValues={defaultValues}
            />
            {/* <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        Cancelar
                    </Button>
                </DialogClose>
                <Button onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
            </DialogFooter> */}
        </>
    );
};