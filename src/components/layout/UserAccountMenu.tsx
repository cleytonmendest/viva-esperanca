// Adicione no topo para marcar como Componente de Cliente
"use client"

import { MoreHorizontal, LogOut, CircleUserRound } from "lucide-react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EditProfileForm } from "@/components/layout/EditProfileForm"
import { useRouter } from "next/navigation"
import { createClient } from "@/libs/supabase/client"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "../ui/button"
import { ChangePasswordForm } from "./ChangePasswordForm"

export const UserAccountMenu = () => {
    const router = useRouter()
    const supabase = createClient()
    const resetAuthStore = useAuthStore((state) => state.reset)

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('Erro ao fazer logout:', error)
            alert('Não foi possível sair. Tente novamente.')
            return
        }

        // Limpa o estado do Zustand
        resetAuthStore()

        // Redireciona para a página de login e atualiza a página
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="w-full">
                        <SidebarMenuButton className="w-full !justify-start p-2">
                            <CircleUserRound size={16} />
                            <div className="flex w-full justify-between gap-1">
                                <span className="text-sm">Minha Conta</span>
                                <MoreHorizontal size={16} />
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Dialog>
                                <DialogTrigger className="w-full text-left">Editar perfil</DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Editar perfil</DialogTitle>
                                        <DialogDescription>
                                            Altere suas informações de perfil aqui.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <EditProfileForm />
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Dialog>
                                <DialogTrigger className="w-full text-left">Alterar senha</DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Alterar senha</DialogTitle>
                                        <DialogDescription>
                                            Sua nova senha deve ter no mínimo 6 caracteres.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ChangePasswordForm />
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Dialog>
                                <DialogTrigger className="w-full text-left">Sair</DialogTrigger>
                                <DialogContent className="w-full !max-w-3xs">
                                    <DialogHeader>
                                        <DialogTitle>Sair</DialogTitle>
                                        <DialogDescription>
                                            Tem certeza que deseja sair?
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-between gap-2">
                                        <DialogClose asChild>
                                            <Button variant="outline">
                                                Cancelar
                                            </Button>
                                        </DialogClose>
                                        <Button variant="destructive" onClick={handleLogout}>
                                            <LogOut />
                                            Sair
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}