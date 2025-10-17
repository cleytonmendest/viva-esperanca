'use client';

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { GenericForm, GenericFormRef } from "@/components/forms/GenericForm";
import { FormConfig } from "@/components/forms/form-config";
import { format, parseISO } from 'date-fns';
import { useRef, useState } from "react";
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
  const formRef = useRef<GenericFormRef>(null);
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
        window.location.reload();
    } else {
        toast.error(result.message, { position: 'top-center' });
    }

    setIsSubmitting(false);
  };

  const handleSave = () => {
    formRef.current?.submit();
  };

  return (
    <>
      <GenericForm
        ref={formRef}
        formConfig={editProfileFormConfig}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        defaultValues={defaultValues}
        showSubmitButton={false}
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </>
  );
};