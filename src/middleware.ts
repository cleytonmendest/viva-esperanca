import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './libs/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Chama a função auxiliar para gerenciar a sessão e obter o usuário.
  const { response, user } = await updateSession(request)

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

