// src/middlewares/adminAuth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function adminAuthMiddleware(request: NextRequest) {
    const response = NextResponse.next();
    const url = request.nextUrl.clone();
    const { pathname } = url;

    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session && pathname !== '/admin/login' && pathname !== '/admin/signup') {
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
    }

    if (session) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role === 'pendente' && pathname !== '/admin/pending-approval') {
            url.pathname = '/admin/pending-approval';
            return NextResponse.redirect(url);
        }
    }

    // Se tudo estiver OK para as rotas de admin, continua
    return response;
}