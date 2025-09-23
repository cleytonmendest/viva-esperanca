'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { createClient } from "@/libs/supabase/client"
import type { Tables, TablesInsert, Enums } from "@/libs/supabase/database.types"
import { applyPhoneMask, isPhoneNumberValid, unmaskPhoneNumber } from "@/utils/format"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Combobox } from "../Combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

type AddVisitorProps = {
    members: Tables<'members'>[]
}

type VisitorFormData = {
    name: string;
    phone: string;
    visit_date: string;
    event_name: string;
    invited_by: string;
    first_time: boolean;
    visitor_status: Tables<'visitors'>['visitor_status']
};

const AddNewVisitorDialog = ({ members }: AddVisitorProps) => {
    const [formData, setFormData] = useState<VisitorFormData>({
        name: '',
        phone: '',
        visit_date: '',
        event_name: '',
        invited_by: '',
        first_time: true,
        visitor_status: "sem_igreja"
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
        setFormData({ name: '', phone: '', visit_date: '', event_name: '', first_time: true, invited_by: '', visitor_status: 'sem_igreja' });
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

        const visitorData: TablesInsert<'visitors'> = {
            visitor_name: formData.name,
            visitor_whatsapp: cleanedPhone,
            visite_date: formData.visit_date,
            event_name: formData.event_name,
            first_time: formData.first_time,
            invited_by: formData.invited_by !== '' ? formData.invited_by as Tables<'members'>['id'] : null,
            visitor_status: formData.visitor_status as Enums<'visitor_status_enum'>
        }

        const { error } = await supabase.from('visitors').insert([visitorData]);

        if (error) {
            console.error('Erro ao adicionar visitante:', error);
            toast.error('Tivemos um problema ao adicionar o visitante. Tente novamente mais tarde.', { position: 'top-center' });
            setIsSubmitting(false);
        } else {
            toast.success('visitante adicionado com sucesso!', { position: 'top-center' });
            resetForm();
            setIsOpen(false);
            router.refresh();
        }
    };

    const isFormValid = formData.name && isPhoneNumberValid(formData.phone) && formData.visitor_status;

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
                    <div className="flex gap-4 flex-col-reverse md:flex-row">
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="name">Nome: *</Label>
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
                            <Label htmlFor="first_time">Primeira visita? *</Label>
                            <RadioGroup
                                value={String(formData.first_time)}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, first_time: value === 'true' }))}
                                defaultValue={String(formData.first_time)}
                                className="flex">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="true" id="option-one" />
                                    <Label htmlFor="option-one">Sim</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="false" id="option-two" />
                                    <Label htmlFor="option-two">Não</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="visit_date">Data da Visita: *</Label>
                            <Input
                                type="date"
                                name="visit_date"
                                value={formData.visit_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="phone">Telefone: *</Label>
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
                    <div className="flex gap-4 flex-col md:flex-row">
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="invited_by">Convidado por:</Label>
                            <Combobox
                                empty="Nenhum membro encontrado"
                                options={members.map(member => ({ value: member.id, label: member.name }))}
                                placeholder="Selecione..."
                                value={formData.invited_by}
                                onChange={(value: string) => setFormData(prev => ({ ...prev, invited_by: value }))}
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <Label htmlFor="visitor_status">Situação do Visitante: *</Label>
                            <Select
                                defaultValue={formData.visitor_status as string}
                                onValueChange={(value: string) => setFormData(prev => ({ ...prev, visitor_status: value as Tables<'visitors'>['visitor_status']}))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sem_igreja">
                                        Sem Igreja
                                    </SelectItem>
                                    <SelectItem value="visitante_outra_igreja">
                                        Membro de outra Igreja
                                    </SelectItem>
                                    <SelectItem value="afastado">
                                        Afastado
                                    </SelectItem>
                                    <SelectItem value="pendente">
                                        Indeciso
                                    </SelectItem>
                                </SelectContent>
                            </Select>
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

