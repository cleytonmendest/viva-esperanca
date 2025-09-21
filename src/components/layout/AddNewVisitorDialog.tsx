'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { createClient } from "@/libs/supabase/client"
import type { TablesInsert } from "@/libs/supabase/database.types"
import { applyPhoneMask, isPhoneNumberValid, unmaskPhoneNumber } from "@/utils/format"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

const AddNewVisitorDialog = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        visit_date: '',
        event_name: '',
        invited_by: '',
        first_time: true,
        visitor_status: 'sem_igreja'
    });
    const [phoneError, setPhoneError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const supabase = createClient();

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

    const resetForm = () => {
        setFormData({ name: '', phone: '', visit_date: '', event_name: '', first_time: false, invited_by: '', visitor_status: 'sem_igreja' });
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

        const memberData: TablesInsert<'visitors'> = {
            visitor_name: formData.name,
            visitor_whatsapp: cleanedPhone,
            visite_date: 'telefone',
            event_name: 'event_name',
            first_time: true,
            invited_by: 'invited_by',
            visitor_status: 'sem_igreja'
        }

        const { error } = await supabase.from('visitors').insert([memberData]);

        if (error) {
            console.error('Erro ao adicionar visitante:', error);
            // alert('Erro ao adicionar visitante: ' + error.message);
            toast.error('Tivemos um problema ao adicionar o visitante. Tente novamente mais tarde.', { position: 'top-center' });
            setIsSubmitting(false);
        } else {
            toast.success('visitante adicionado com sucesso!', { position: 'top-center' });
            resetForm();
            setIsOpen(false);
            router.refresh();
        }
    };

    const isFormValid = formData.name && formData.first_time && isPhoneNumberValid(formData.phone) && formData.visitor_status;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">
                    Adicionar Visitante
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Visitantes</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para adicionar um novo visitante.
                    </DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                type="text"
                                name="name"
                                placeholder="Digite o nome do visitante"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <Label htmlFor="first_time">Primeira visita?</Label>
                            <RadioGroup defaultValue="option-one" className="flex">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-one" id="option-one" />
                                    <Label htmlFor="option-one">Sim</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-two" id="option-two" />
                                    <Label htmlFor="option-two">Não</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="birthdate">Data da Visita</Label>
                            <Input
                                type="date"
                                name="birthdate"
                                value={formData.visit_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
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

export default AddNewVisitorDialog;

