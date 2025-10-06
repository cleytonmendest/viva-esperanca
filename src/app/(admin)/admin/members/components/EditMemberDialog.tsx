'use client'

import { Pencil } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Constants, Tables, TablesUpdate } from "@/libs/supabase/database.types"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MultiSelect, OptionType } from "@/components/MultiSelect"
import { applyPhoneMask, formatPhoneNumber, isPhoneNumberValid, unmaskPhoneNumber } from "@/utils/format"
import { arraysAreEqual } from "@/libs/utils"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/authStore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select"
import { updateMember } from "../../lib/actions"

type EditMemberDialogProps = {
    member: Tables<'members'>
}

const EditMemberDialog = ({ member }: EditMemberDialogProps) => {
    const [initialData, setInitialData] = useState({
        name: member.name,
        phone: formatPhoneNumber(member.phone),
        birthdate: member.birthdate,
        sector: member.sector ?? [],
        role: member.role
    });

    const [formData, setFormData] = useState(initialData);
    const [phoneError, setPhoneError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { profile } = useAuthStore()

    // Atualiza o estado se a prop `member` mudar
    useEffect(() => {
        const newInitialData = {
            name: member.name,
            phone: formatPhoneNumber(member.phone),
            birthdate: member.birthdate,
            sector: member.sector ?? [],
            role: member.role
        };
        setInitialData(newInitialData);
        setFormData(newInitialData);
    }, [member]);

    const isChanged = useMemo(() => {
        const initialPhoneClean = unmaskPhoneNumber(initialData.phone);
        const currentPhoneClean = unmaskPhoneNumber(formData.phone);

        if (initialData.name !== formData.name) return true;
        if (initialPhoneClean !== currentPhoneClean) return true;
        if (initialData.birthdate !== formData.birthdate) return true;
        if (!arraysAreEqual(initialData.sector, formData.sector)) return true;

        return false;
    }, [formData, initialData]);

    const sectorOptions: OptionType[] = Constants.public.Enums.sector_enum.map(sector => ({
        value: sector,
        label: sector.charAt(0).toUpperCase() + sector.slice(1)
    }));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const maskedValue = applyPhoneMask(value);
            setFormData((prev) => ({ ...prev, [name]: maskedValue }));

            if (isPhoneNumberValid(maskedValue) || maskedValue === '') {
                setPhoneError('');
            } else {
                setPhoneError('O telefone deve ter 11 dígitos.');
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSectorsChange = (newSectors: string[]) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            sector: newSectors as (typeof Constants.public.Enums.sector_enum[number])[]
        }));
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reseta o formulário para os dados iniciais ao fechar
            setFormData(initialData);
            setPhoneError('');
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isChanged || !isPhoneNumberValid(formData.phone)) {
            if (!isPhoneNumberValid(formData.phone)) {
                setPhoneError('Por favor, insira um telefone válido com 11 dígitos.');
            }
            return;
        }

        setIsSubmitting(true);
        const cleanedPhone = unmaskPhoneNumber(formData.phone);

        const memberData: TablesUpdate<'members'> = {
            name: formData.name,
            phone: cleanedPhone,
            birthdate: formData.birthdate,
            sector: formData.sector,
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

    const isFormValid = formData.name && formData.birthdate && isPhoneNumberValid(formData.phone);
    const canSubmit = isChanged && isFormValid && !isSubmitting;

    if (member.user_id && profile?.role !== 'admin') return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            type="text"
                            name="name"
                            placeholder="Digite o nome do membro"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            type="text"
                            name="phone"
                            placeholder="(21) 99999-9999"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            maxLength={15}
                        />
                        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="birthdate">Data de Nascimento</Label>
                            <Input
                                type="date"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="sector">Setor</Label>
                            <MultiSelect
                                options={sectorOptions}
                                selected={formData.sector}
                                onChange={handleSectorsChange as React.Dispatch<React.SetStateAction<string[]>>}
                                placeholder="Selecione..."
                                className="w-full"
                            />
                        </div>
                    </div>
                    {profile?.role === 'admin' &&
                        <div className="flex gap-4">
                            <Label>Role</Label>
                            <Select defaultValue={formData.role}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">
                                        Admin
                                    </SelectItem>
                                    <SelectItem value="pastor(a)">
                                        Pastor(a)
                                    </SelectItem>
                                    <SelectItem value="lider_midia">
                                        Lider Mídia
                                    </SelectItem>
                                    <SelectItem value="lider_geral">
                                        Lider Geral
                                    </SelectItem>
                                    <SelectItem value="membro">
                                        Membro
                                    </SelectItem>
                                    <SelectItem value="pendente">
                                        Pendente
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    }
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={!canSubmit}>
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditMemberDialog;
