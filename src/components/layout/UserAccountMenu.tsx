// Adicione no topo para marcar como Componente de Cliente
"use client"

import { MoreHorizontal, Settings } from "lucide-react"
import { SidebarMenu, SidebarMenuAction, SidebarMenuItem } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EditProfileForm } from "@/components/layout/EditProfileForm"

export const UserAccountMenu = () => {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                        <SidebarMenuAction asChild className="static">
                            <div className="w-full !justify-between p-2">
                                <div className="flex items-center gap-2">
                                    <Settings size={16} />
                                    <span className="text-sm">Minha Conta</span>
                                </div>
                                <MoreHorizontal />
                            </div>
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                        {/* O onSelect evita que o menu feche ao abrir o dialog */}
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
                                    {/* Use o componente de formulário aqui */}
                                    <EditProfileForm />
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Dialog>
                                <DialogTrigger className="w-full text-left">Alterar senha</DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        {/* Conteúdo do modal de alterar senha */}
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Dialog>
                                <DialogTrigger className="w-full text-left">Sair</DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        sair
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}