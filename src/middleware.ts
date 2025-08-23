import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    const pathname = url.pathname;

    const supabase = createMiddlewareClient({ req: request, res: response })
    const { data: { session } } = await supabase.auth.getSession()

    const cleanHostname = hostname.split(':')[0];

    const prodDomain = 'igreja-viva-esperanca.com';
    const devDomain = 'viva-esperanca.local';

    const isAdminSubdomain = cleanHostname === `admin.${prodDomain}` || cleanHostname === `admin.${devDomain}`;
    const isMainDomain = cleanHostname === prodDomain || cleanHostname === devDomain;

    if (isAdminSubdomain) {

        if (!session && pathname !== '/login') {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session?.user.id)
            .single();

        if (profile?.role === 'pendente') {
            if (request.nextUrl.pathname !== '/pending-approval') {
                return NextResponse.redirect(new URL('/pending-approval', request.url));
            }
        }

        url.pathname = `/admin${pathname}`;
        return NextResponse.rewrite(url);
    }

    if (isMainDomain && pathname.startsWith('/admin')) {

        const newPathname = pathname.replace('/admin', '');

        url.hostname = `admin.${cleanHostname}`;
        url.pathname = newPathname === '' ? '/' : newPathname;
        url.port = request.nextUrl.port;

        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};