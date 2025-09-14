import { Calendar, Church, Home, Inbox, PersonStanding, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <span>Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>  
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar