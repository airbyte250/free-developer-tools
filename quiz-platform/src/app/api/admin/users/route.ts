import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { verifyApiAuth } from '@/lib/auth-api'

export async function GET(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')

  const users = await prisma.user.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
    },
  })

  return Response.json(users)
}

export async function PUT(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status, role } = body

  if (!id) {
    return Response.json({ error: 'Missing user id' }, { status: 400 })
  }

  if (status && !['pending', 'active', 'rejected'].includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(role && { role }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
    },
  })

  return Response.json(user)
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Missing user id' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })

  return Response.json({ success: true })
}
