import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { verifyApiAuth } from '@/lib/auth-api'

export async function GET(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.goSettings.findMany()
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

  for (const [key, value] of Object.entries(body)) {
    await prisma.goSettings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { id: key, key, value: String(value) },
    })
  }

  return Response.json({ success: true })
}
