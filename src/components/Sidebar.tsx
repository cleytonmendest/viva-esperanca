import { createClient } from "../libs/supabase/server"
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
} from "./ui/sidebar"
// Importe o novo componente de cliente
import { UserAccountMenu } from "./layout/UserAccountMenu"
import { Database } from "../libs/supabase/database.types"

type Role = Database['public']['Enums']['user_role_enum'];

const allItems: { title: string; url: string; icon: React.ElementType, roles: Role[] }[] = [
  { title: "Página Inicial", url: "/admin", icon: Home, roles: ['admin', 'pastor(a)', 'lider_midia', 'lider_geral', 'membro', 'pendente'] },
  { title: "Membros", url: "/admin/members", icon: Church, roles: ['admin', 'pastor(a)'] },
  { title: "Visitantes", url: "/admin/visitors", icon: PersonStanding, roles: ['admin', 'pastor(a)', 'lider_geral'] },
  { title: "Eventos", url: "/admin/events", icon: Calendar, roles: ['admin', 'pastor(a)', 'lider_midia', 'lider_geral', 'membro'] },
]

// Este componente agora é um Server Component assíncrono para buscar os dados do usuário
const AppSidebar = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('members').select('role').eq('user_id', user.id).single()
    : { data: null }

  const userRole = profile?.role ?? null

  // Filtra os itens do menu com base na role do usuário logado
  const items = allItems.filter(item => userRole && item.roles.includes(userRole))

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

