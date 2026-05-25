import { prisma } from '@/lib/prisma'
import { invalidateTenantCache } from '@/lib/tenant'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')

  const tenants = await prisma.tenant.findMany({
    where: status ? { status } : undefined,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(tenants)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    hostname,
    categoryId,
    adClientId,
    bannerSlotId,
    interstitialSlotId,
    anchorSlotId,
    analyticsId,
    adsTxtLines,
  } = body

  if (!hostname || !categoryId || !adClientId || !bannerSlotId || !interstitialSlotId || !anchorSlotId) {
    return Response.json(
      { error: 'Missing required fields: hostname, categoryId, adClientId, bannerSlotId, interstitialSlotId, anchorSlotId' },
      { status: 400 }
    )
  }

  const existingTenant = await prisma.tenant.findUnique({
    where: { hostname },
  })

  if (existingTenant) {
    return Response.json(
      { error: 'Tenant with this hostname already exists' },
      { status: 409 }
    )
  }

  const tenant = await prisma.tenant.create({
    data: {
      hostname,
      categoryId,
      adClientId,
      bannerSlotId,
      interstitialSlotId,
      anchorSlotId,
      analyticsId: analyticsId || null,
      adsTxt: adsTxtLines?.length
        ? {
            create: adsTxtLines.map((line: string) => ({ line })),
          }
        : undefined,
    },
    include: { category: true, adsTxt: true },
  })

  return Response.json(tenant, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return Response.json({ error: 'Missing tenant id' }, { status: 400 })
  }

  const existing = await prisma.tenant.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      hostname: data.hostname,
      categoryId: data.categoryId,
      adClientId: data.adClientId,
      bannerSlotId: data.bannerSlotId,
      interstitialSlotId: data.interstitialSlotId,
      anchorSlotId: data.anchorSlotId,
      analyticsId: data.analyticsId || null,
      status: data.status,
    },
    include: { category: true },
  })

  // Invalidate cache for both old and new hostname
  await invalidateTenantCache(existing.hostname)
  if (data.hostname && data.hostname !== existing.hostname) {
    await invalidateTenantCache(data.hostname)
  }

  return Response.json(tenant)
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Missing tenant id' }, { status: 400 })
  }

  const tenant = await prisma.tenant.findUnique({ where: { id } })
  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  await prisma.tenant.delete({ where: { id } })
  await invalidateTenantCache(tenant.hostname)

  return Response.json({ success: true })
}
