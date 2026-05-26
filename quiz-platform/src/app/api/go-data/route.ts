import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const setting = await prisma.goSettings.findUnique({ where: { key } })
  return setting?.value ?? defaultValue
}

export async function POST(request: NextRequest) {
  // Security: check referer
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

  // Check FB browser only setting
  const fbOnly = await getSetting('fb_browser_only', '0')
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
  const tilesVisibility = await getSetting('tiles_visibility', 'go_only')
  if (tilesVisibility === 'go_only') {
    // Check _t cookie from request
    const cookieHeader = request.headers.get('cookie') || ''
    if (!cookieHeader.includes('_t=')) {
      return Response.json({ success: true, data: null })
    }
  }

  // Get images
  const images = await prisma.goImage.findMany()
  if (images.length === 0) {
    return Response.json({ success: true, data: null })
  }

  // Pick random image
  const image = images[Math.floor(Math.random() * images.length)]

  // Get config
  const config = {
    g: '/go',
    v: parseInt(await getSetting('video_loading_enabled', '1'), 10),
    t: parseInt(await getSetting('video_loading_timer', '5'), 10),
    y: await getSetting('video_loading_style', 'youtube'),
    h: parseInt(await getSetting('hide_featured_image', '1'), 10),
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
