import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_HOSTNAMES = ['app.coolganwar.com']

export function proxy(request: NextRequest) {
  const rawHost = request.headers.get('host') || ''
  const hostname = rawHost.split(':')[0]

  // Store hostname in request headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-host', hostname)

  const pathname = request.nextUrl.pathname

  // Route app.coolganwar.com to admin dashboard
  if (ADMIN_HOSTNAMES.includes(hostname)) {
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      const url = request.nextUrl.clone()
      url.pathname = `/admin${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      })
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
