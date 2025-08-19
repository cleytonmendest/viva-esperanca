import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    const pathname = url.pathname;

    const cleanHostname = hostname.split(':')[0];

    // Seus domínios
    const prodDomain = 'igreja-viva-esperanca.com';
    const devDomain = 'viva-esperanca.local';

    const isMainDomain = cleanHostname === prodDomain || cleanHostname === devDomain;

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