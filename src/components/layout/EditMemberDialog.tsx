'use client'

import { EllipsisVertical } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Constants, Tables } from "@/libs/supabase/database.types"
import { Input } from "../ui/input"
import { useState } from "react"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/libs/supabase/client"
import { MultiSelect, OptionType } from "../MultiSelect"

type EditMemberDialogProps = {
    member: Tables<'members'>
}

const EditMemberDialog = ({ member }: EditMemberDialogProps) => {
    const [formData, setFormData] = useState({
        name: member.name,
        phone: member.phone,
        birthdate: member.birthdate,
        sector: member.sector ?? []
    })

    const sectorOptions: OptionType[] = Constants.public.Enums.sector_enum.map(sector => ({
        value: sector,
        // Transforma a primeira letra em maiúscula para uma melhor UI
        label: sector.charAt(0).toUpperCase() + sector.slice(1)
    }));

    console.log(member)

    const router = useRouter()
    const supabase = createClient()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSectorsChange = (newSectors: string[]) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            sector: newSectors as (typeof Constants.public.Enums.sector_enum[number])[]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // const memberData: TablesInsert<'members'> = {
        //     name: formData.name,
        //     phone: formData.phone,
        //     birthdate: formData.birthdate,
        //     sector: formData.sector === 'sem' || formData.sector === '' ? null : [formData.sector as Enums<'sector_enum'>],
        // }

        // const { error } = await supabase.from('members').insert([memberData])

        // if (error) {
        //     console.error('Erro ao adicionar membro:', error)
        //     alert('Erro ao adicionar membro: ' + error.message)
        // } else {
        //     alert('Membro adicionado com sucesso!')
        //     setFormData({ name: '', phone: '', birthdate: '', sector: '' })
        //     router.refresh()
        // }
    }

    return (
        <Dialog>
            <DialogTrigger>
                <EllipsisVertical size={16} />
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
                            placeholder="Digite o telefone do membro"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="birthdate">Data de Nascimento</Label>
                            <Input
                                type="date"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="sector">Setor</Label>
                            <MultiSelect
                                options={sectorOptions}
                                selected={formData.sector}
                                onChange={handleSectorsChange as React.Dispatch<React.SetStateAction<string[]>>}
                                placeholder="Selecione o(s) setor(es)"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit">
                            Salvar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditMemberDialog