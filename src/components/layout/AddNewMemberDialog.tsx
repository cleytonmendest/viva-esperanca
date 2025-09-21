'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { createClient } from "@/libs/supabase/client"
import type { TablesInsert, Enums } from "@/libs/supabase/database.types"
import { MultiSelect, OptionType } from "../MultiSelect"
import { Constants } from "@/libs/supabase/database.types"
import { applyPhoneMask, isPhoneNumberValid, unmaskPhoneNumber } from "@/utils/format"
import { toast } from "sonner"

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
            toast.error('Tivemos um problema ao adicionar o membro. Tente novamente mais tarde.', {position: 'top-center'});
            setIsSubmitting(false);
        } else {
            toast.success('Membro adicionado com sucesso!', {position: 'top-center'});
            resetForm();
            setIsOpen(false);
            router.refresh();
        }
    };

    const isFormValid = formData.name && formData.birthdate && isPhoneNumberValid(formData.phone);

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
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={!isFormValid || isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewMemberDialog;

