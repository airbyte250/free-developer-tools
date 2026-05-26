import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

async function getSetting(key: string, tenantId: string | null, defaultValue: string = ''): Promise<string> {
  if (tenantId) {
    const tenantSetting = await prisma.goSettings.findFirst({ where: { key, tenantId } })
    if (tenantSetting) return tenantSetting.value
  }
  const globalSetting = await prisma.goSettings.findFirst({ where: { key, tenantId: null } })
  return globalSetting?.value ?? defaultValue
}

export async function POST(request: NextRequest) {
  const referer = request.headers.get('referer') || ''
  const host = request.headers.get('host') || ''
  const hostClean = host.replace(/:\d+$/, '')

  if (referer) {
    try {
      const refHost = new URL(referer).hostname
      if (refHost !== hostClean && !refHost.endsWith('.' + hostClean)) {
        return Response.json({ success: true, data: null })
      }
    } catch {}
  }

  // Find tenant for this hostname
  const tenant = await prisma.tenant.findUnique({ where: { hostname: hostClean } })
  const tenantId = tenant?.id || null

  // Check FB browser only setting
  const fbOnly = await getSetting('fb_browser_only', tenantId, '0')
  if (fbOnly === '1') {
    const ua = (request.headers.get('user-agent') || '').toLowerCase()
    const isFb = ['fban', 'fbav', 'fb_iab', 'facebook', 'instagram', 'messenger'].some(
      (k) => ua.includes(k)
    )
    if (!isFb) {
      return Response.json({ success: true, data: null })
    }
  }

  // Check tiles visibility
  const tilesVisibility = await getSetting('tiles_visibility', tenantId, 'go_only')
  if (tilesVisibility === 'go_only') {
    const cookieHeader = request.headers.get('cookie') || ''
    if (!cookieHeader.includes('_t=')) {
      return Response.json({ success: true, data: null })
    }
  }

  // Get images for this tenant
  const images = await prisma.goImage.findMany({ where: { tenantId } })
  if (images.length === 0) {
    // Fallback to global images if no tenant-specific images
    const globalImages = await prisma.goImage.findMany({ where: { tenantId: null } })
    if (globalImages.length === 0) {
      return Response.json({ success: true, data: null })
    }
    const image = globalImages[Math.floor(Math.random() * globalImages.length)]
    return buildResponse(image, tenantId)
  }

  const image = images[Math.floor(Math.random() * images.length)]
  return buildResponse(image, tenantId)
}

async function buildResponse(image: { link: string; tileId: string; cols: number; rows: number; count: number; width: number; height: number; manifest: unknown }, tenantId: string | null) {
  const config = {
    g: '/go',
    v: parseInt(await getSetting('video_loading_enabled', tenantId, '1'), 10),
    t: parseInt(await getSetting('video_loading_timer', tenantId, '5'), 10),
    y: await getSetting('video_loading_style', tenantId, 'youtube'),
    h: parseInt(await getSetting('hide_featured_image', tenantId, '1'), 10),
  }

  return Response.json({
    success: true,
    data: {
      config,
      image: {
        link: image.link,
        tileId: image.tileId,
        cols: image.cols,
        rows: image.rows,
        count: image.count,
        width: image.width,
        height: image.height,
        manifest: image.manifest,
        base: `/tiles/${image.tileId}`,
      },
    },
  }, {
    headers: {
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}


