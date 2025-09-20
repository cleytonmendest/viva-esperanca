import { Calendar, Church, Home, PersonStanding } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
// Importe o novo componente de cliente
import { UserAccountMenu } from "./layout/UserAccountMenu"

const items = [
  { title: "Página Inicial", url: "/admin", icon: Home },
  { title: "Membros", url: "/admin/members", icon: Church },
  { title: "Visitantes", url: "/admin/visitors", icon: PersonStanding },
  { title: "Eventos", url: "/admin/events", icon: Calendar },
]

// Este componente continua sendo um Server Component por padrão
const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <UserAccountMenu />
      </SidebarHeader>
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
    </Sidebar>
  )
}

export default AppSidebar