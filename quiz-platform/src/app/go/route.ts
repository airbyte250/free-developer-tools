import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getSetting(key: string, tenantId: string | null, defaultValue: string = ''): Promise<string> {
  // Try tenant-specific setting first, then fall back to global
  if (tenantId) {
    const tenantSetting = await prisma.goSettings.findFirst({ where: { key, tenantId } })
    if (tenantSetting) return tenantSetting.value
  }
  const globalSetting = await prisma.goSettings.findFirst({ where: { key, tenantId: null } })
  return globalSetting?.value ?? defaultValue
}

export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const cleanHost = hostname.replace(/:\d+$/, '')

  // Find tenant for this hostname
  const tenant = await prisma.tenant.findUnique({
    where: { hostname: cleanHost },
    include: { category: true },
  })

  const tenantId = tenant?.id || null

  // Check if Go redirect is enabled
  const goEnabled = await getSetting('go_enabled', tenantId, '1')
  if (goEnabled !== '1') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Visit count redirect logic
  const visitRedirectEnabled = await getSetting('visit_redirect_enabled', tenantId, '0')
  if (visitRedirectEnabled === '1') {
    const visitThreshold = parseInt(await getSetting('visit_redirect_count', tenantId, '3'), 10)
    const visitRedirectUrl = await getSetting('visit_redirect_url', tenantId, '/')
    const visitResetAfter = (await getSetting('visit_redirect_reset', tenantId, '1')) === '1'
    const visitExpiry = parseInt(await getSetting('visit_redirect_expiry', tenantId, '30'), 10)

    const cookieStore = await cookies()
    const currentCount = parseInt(cookieStore.get('_jgt_vc')?.value || '0', 10)
    const newCount = currentCount + 1

    if (newCount > visitThreshold) {
      const response = NextResponse.redirect(visitRedirectUrl.startsWith('http') ? visitRedirectUrl : new URL(visitRedirectUrl, request.url))
      if (visitResetAfter) {
        response.cookies.delete('_jgt_vc')
      }
      return response
    }

    const response = await buildGoRedirect(request, tenant)
    response.cookies.set('_jgt_vc', String(newCount), {
      maxAge: visitExpiry * 60,
      path: '/',
      sameSite: 'lax',
    })
    return response
  }

  return buildGoRedirect(request, tenant)
}

async function buildGoRedirect(request: NextRequest, tenant: { id: string; category: { quizData: unknown } } | null): Promise<NextResponse> {
  let quizSlugs: string[] = []

  if (tenant) {
    const quizData = tenant.category.quizData as { quizzes?: Array<{ slug: string }> }
    quizSlugs = (quizData.quizzes || []).map((q) => q.slug)
  } else {
    // Get all quizzes from all categories
    const categories = await prisma.category.findMany()
    for (const cat of categories) {
      const quizData = cat.quizData as { quizzes?: Array<{ slug: string }> }
      quizSlugs.push(...(quizData.quizzes || []).map((q) => q.slug))
    }
  }

  if (quizSlugs.length === 0) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Pick random quiz
  const randomSlug = quizSlugs[Math.floor(Math.random() * quizSlugs.length)]
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const redirectUrl = `${proto}://${host}/quiz/${randomSlug}`

  // Use 307 temporary redirect (browsers must not cache this)
  const response = NextResponse.redirect(redirectUrl, 307)

  // Set _t cookie (marks user as coming from /go)
  response.cookies.set('_t', '1', {
    path: '/',
    sameSite: 'lax',
    maxAge: 86400,
  })

  // Aggressively prevent ALL caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private, max-age=0, s-maxage=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Vary', '*')
  response.headers.set('CDN-Cache-Control', 'no-store')
  response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store')

  return response
}
