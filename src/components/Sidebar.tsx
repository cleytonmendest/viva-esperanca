import { createClient } from "@/lib/supabase/server"
import { Calendar, Church, Home, PersonStanding, ShieldCheck, ListTodo, BarChart3, BookOpen, Activity } from "lucide-react"
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
import { UserAccountMenu } from "./layout/UserAccountMenu"

// Mapeamento de ícones para não precisar guardar componentes no DB
const iconMap = {
  Home,
  Church,
  PersonStanding,
  Calendar,
  ShieldCheck,
  ListTodo,
  BarChart3,
  BookOpen,
  Activity
};

const AppSidebar = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('members').select('role').eq('user_id', user.id).single()
    : { data: null }

  const userRole = profile?.role ?? null;

  // Busca as páginas do banco de dados
  const { data: pages } = await supabase
    .from('page_permissions')
    .select('*');

  // Filtra os itens do menu com base na role do usuário logado
  const items = pages
    ? pages.filter(page => userRole && page.allowed_roles.includes(userRole))
    : [];

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
              {items.map((item) => {
                // Garante que sempre haverá um ícone válido, mesmo se o valor do DB não estiver no mapa
                const IconComponent = (item.icon && iconMap[item.icon as keyof typeof iconMap]) || Home;
                return (
                  <SidebarMenuItem key={item.page_name}>
                    <SidebarMenuButton asChild>
                      <a href={item.page_path}>
                        <IconComponent />
                        <span>{item.page_name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
    </Sidebar>
  )
}

export default AppSidebar