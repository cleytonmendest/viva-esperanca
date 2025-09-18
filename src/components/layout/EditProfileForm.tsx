// Adicione no topo para marcar como Componente de Cliente
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"

// Supondo que você tenha um store do Zustand assim:
// import { useUserStore } from "@/store/user-store"

export const EditProfileForm = () => {
    // Exemplo de como você usaria o Zustand
    // const { user, updateUser } = useUserStore()

    // Para demonstração, usaremos dados mocados
    const user = {
        name: "Usuário Exemplo",
        phone: "21999998888",
        birthDate: "1990-01-15",
    }

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        birthDate: "",
    })
    const [isChanged, setIsChanged] = useState(false)

    // Preenche o formulário com dados do usuário quando o componente monta
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                phone: user.phone,
                birthDate: user.birthDate,
            })
        }
    }, [user])

    // Verifica se houve mudanças para habilitar o botão de salvar
    useEffect(() => {
        const hasChanged =
            formData.name !== user.name ||
            formData.phone !== user.phone ||
            formData.birthDate !== user.birthDate
        setIsChanged(hasChanged)
    }, [formData, user])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isChanged) return
        console.log("Salvando dados:", formData)
        // Aqui você chamaria a função updateUser(formData) do seu store
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="py-4">
                <Input
                    name="name"
                    type="text"
                    placeholder="Nome"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mb-4 mt-2 w-full"
                />
                <Input
                    name="phone"
                    type="text"
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mb-4 w-full"
                />
                <Input
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="mb-4 w-full"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        Cancelar
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={!isChanged}>
                    Salvar
                </Button>
            </DialogFooter>
        </form>
    )
}