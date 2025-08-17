import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Extrai o hostname (ex: 'admin.seusite.com', 'seusite.com')
    const hostname = request.headers.get('host');

    // Define o seu domínio principal
    const mainDomain = 'igreja-viva-esperanca.com';

    // Se o hostname for o do subdomínio do admin...
    if (hostname === `admin.${mainDomain}`) {
        // Re-escreve a URL internamente para a rota /admin, sem mudar a URL no navegador
        return NextResponse.rewrite(new URL('/admin', request.url));
    }

    // Se for o domínio principal...
    if (hostname === mainDomain) {
        // Re-escreve a URL internamente para a rota /main.
        return NextResponse.rewrite(new URL('/main', request.url));
    }
}

// Configuração para dizer ao middleware em quais rotas ele deve rodar
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};