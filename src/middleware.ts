// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuthMiddleware } from './middlewares/adminAuth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Se a rota for para o admin, usa o middleware de autenticação
    if (pathname.startsWith('/admin')) {
        return adminAuthMiddleware(request);
    }

    // Se você tivesse um middleware para a API, seria algo como:
    // if (pathname.startsWith('/api')) {
    //     return apiRateLimiterMiddleware(request);
    // }

    // Para todas as outras rotas, não faz nada
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};