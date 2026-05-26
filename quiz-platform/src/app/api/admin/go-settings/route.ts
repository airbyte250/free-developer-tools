import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { verifyApiAuth } from '@/lib/auth-api'

export async function GET(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = request.nextUrl.searchParams.get('tenantId') || null

  const settings = await prisma.goSettings.findMany({
    where: { tenantId },
  })
  const result: Record<string, string> = {}
  for (const s of settings) {
    result[s.key] = s.value
  }

  return Response.json(result)
}

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { tenantId, ...settingsData } = body

  const tid = tenantId || null

  for (const [key, value] of Object.entries(settingsData)) {
    const existing = await prisma.goSettings.findFirst({
      where: { key, tenantId: tid },
    })

    if (existing) {
      await prisma.goSettings.update({
        where: { id: existing.id },
        data: { value: String(value) },
      })
    } else {
      await prisma.goSettings.create({
        data: { id: `${key}_${tid || 'global'}`, key, value: String(value), tenantId: tid },
      })
    }
  }

  return Response.json({ success: true })
}
