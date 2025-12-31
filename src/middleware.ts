import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Chama a função auxiliar para gerenciar a sessão e obter o usuário.
  const { response, user, supabase } = await updateSession(request)
  const { data: profile } = user
    ? await supabase.from('members').select(`
        *,
        roles!role_id(id, name, description, is_leadership)
      `).eq('user_id', user.id).single()
    : { data: null }

  const pathname = request.nextUrl.pathname;

  // Detecta role usando sistema novo (roles table) ou fallback para enum antigo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (profile as any)?.roles?.name || (profile as any)?.role;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLeadership = (profile as any)?.roles?.is_leadership || false;

  // Lógica de proteção de rota:
  // Se não houver usuário e a rota for do admin (exceto login/signup)...
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login') &&
    !request.nextUrl.pathname.startsWith('/admin/signup')
  ) {
    // ...redireciona para a página de login.
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // Redireciona membros pendentes para página de aprovação
  // EXCETO se for líder (para que admins/líderes possam aprovar membros)
  if(
    user &&
    (userRole === 'Pendente' || userRole === 'pendente') &&
    !isLeadership &&
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/pending-approval')
  ){
    const url = request.nextUrl.clone()
    url.pathname = '/admin/pending-approval'
    return NextResponse.redirect(url)
  }

  // Pula verificação de permissões para rotas especiais
  const skipPermissionCheck =
    pathname === '/admin/pending-approval' ||
    pathname === '/admin/unauthorized' ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/signup')

  if (!skipPermissionCheck) {
    const { data: pagePermission } = await supabase
      .from('page_permissions')
      .select('allowed_roles')
      .eq('page_path', pathname)
      .single()

    // Se a página precisa de permissões e o perfil não tem as permissões, redirecionará para unauthorized
    if (pagePermission && profile) {
      // Mapeamento de nomes de roles (nova estrutura) para enums (estrutura antiga usada em page_permissions)
      const roleMap: Record<string, string> = {
        'Admin': 'admin',
        'Pastor(a)': 'pastor(a)',
        'Líder de Mídia': 'lider_midia',
        'Líder Geral': 'lider_geral',
        'Membro': 'membro',
        'Pendente': 'pendente'
      }

      const roleEnum = roleMap[userRole] || userRole?.toLowerCase()

      if (!pagePermission.allowed_roles.includes(roleEnum)) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/unauthorized'
        return NextResponse.redirect(url)
      }
    }
  }

  // Permite que a requisição continue com os cookies de sessão atualizados.
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

