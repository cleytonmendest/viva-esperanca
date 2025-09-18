'use client'

import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select"

const AddNewMemberDialog = () => {
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
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="name">Nome</Label>
                            <Input type="text" name="name" placeholder="Digite o nome do membro" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input type="text" name="phone" placeholder="Digite o telefone do membro" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="birthdate">Data de Nascimento</Label>
                                <Input type="date" name="birthdate" placeholder="Digite o telefone do membro" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="sector">Setor</Label>
                                <Select>
                                    <SelectTrigger>
                                        Selecione o setor
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="pastor(a)">Pastor</SelectItem>
                                        <SelectItem value="lider_midia">Líder Mídia</SelectItem>
                                        <SelectItem value="lider_geral">Líder Geral</SelectItem>
                                        <SelectItem value="lider_louvor">Líder Louvor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-between gap-2">
                            <DialogClose>
                                Cancelar
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