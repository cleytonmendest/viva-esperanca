'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { createClient } from "@/libs/supabase/client"
import type { TablesInsert, Enums } from "@/libs/supabase/database.types"

const AddNewMemberDialog = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        birthdate: '',
        sector: ''
    })
    const router = useRouter()
    const supabase = createClient()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, sector: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const memberData: TablesInsert<'members'> = {
            name: formData.name,
            phone: formData.phone,
            birthdate: formData.birthdate,
            sector: formData.sector === 'sem' || formData.sector === '' ? null : [formData.sector as Enums<'sector_enum'>],
        }

        const { error } = await supabase.from('members').insert([memberData])

        if (error) {
            console.error('Erro ao adicionar membro:', error)
            alert('Erro ao adicionar membro: ' + error.message)
        } else {
            alert('Membro adicionado com sucesso!')
            setFormData({ name: '', phone: '', birthdate: '', sector: '' })
            router.refresh()
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    Adicionar Membro
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Membro</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para adicionar um novo membro.
                    </DialogDescription>
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
                                <Select onValueChange={handleSelectChange} value={formData.sector} required>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione o setor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mídia">Mídia</SelectItem>
                                        <SelectItem value="geral">Geral</SelectItem>
                                        <SelectItem value="louvor">Louvor</SelectItem>
                                        <SelectItem value="infantil">Infantil</SelectItem>
                                        <SelectItem value="social">Social</SelectItem>
                                        <SelectItem value="sem">Sem setor</SelectItem>
                                    </SelectContent>
                                </Select>
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
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewMemberDialog