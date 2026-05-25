import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const rawHost = request.headers.get('host') || ''
  const hostname = rawHost.split(':')[0]

  // Store hostname in request headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-host', hostname)

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
