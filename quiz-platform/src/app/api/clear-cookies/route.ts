import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost'
  const proto = 'https'
  const domain = forwardedHost.replace(/:\d+$/, '')

  const redirectUrl = `${proto}://${domain}/`
  const response = NextResponse.redirect(redirectUrl, 307)

  // Clear all Go tracking cookies
  response.cookies.set('_t', '', { path: '/', maxAge: 0, domain })
  response.cookies.set('_t', '', { path: '/', maxAge: 0 })
  response.cookies.set('_gvc', '', { path: '/', maxAge: 0 })

  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

  return response
}
