import { Calendar, Church, Home, MoreHorizontal, PersonStanding, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const items = [
  {
    title: "Página Inicial",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Membros",
    url: "/admin/members",
    icon: Church,
  },
  {
    title: "Visitantes",
    url: "/admin/visitors",
    icon: PersonStanding,
  },
  {
    title: "Eventos",
    url: "/admin/events",
    icon: Calendar,
  },
]

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>Viva Esperança</SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="pb-14">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <SidebarMenuAction asChild className="static">
                  <div className="w-full !justify-between p-2">
                    <div className="flex items-center gap-2">
                      <Settings size={16} />
                      <span className="text-sm">
                        Minha Conta
                      </span>
                    </div>
                    <MoreHorizontal />
                  </div>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuItem>
                  <Dialog>
                    <DialogTrigger>Editar perfil</DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar perfil</DialogTitle>
                        <DialogDescription>
                          Altere suas informações de perfil aqui.
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        {/* Formulário de edição de perfil */}
                        <Input type="text" placeholder="Nome" className="mb-4 mt-2 w-full" />
                        <Input type="text" placeholder="Telefone" className="mb-4 w-full" />
                        <Input type="date" className="mb-4 w-full" />
                      </div>
                      <DialogFooter>
                        <DialogClose className="cursor-pointer">Cancelar</DialogClose>
                        <Button type="submit" className="cursor-pointer">Salvar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Dialog>
                    <DialogTrigger>Alterar senha</DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar