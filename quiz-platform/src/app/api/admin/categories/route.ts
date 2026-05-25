import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { verifyApiAuth } from '@/lib/auth-api'

export async function GET(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { tenants: true } },
    },
  })

  return Response.json(categories)
}

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { slug, metaTitle, metaDescription, quizData } = body

  if (!slug || !metaTitle || !metaDescription || !quizData) {
    return Response.json(
      { error: 'Missing required fields: slug, metaTitle, metaDescription, quizData' },
      { status: 400 }
    )
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return Response.json(
      { error: 'Category with this slug already exists' },
      { status: 409 }
    )
  }

  const category = await prisma.category.create({
    data: { slug, metaTitle, metaDescription, quizData },
  })

  return Response.json(category, { status: 201 })
}

export async function PUT(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return Response.json({ error: 'Missing category id' }, { status: 400 })
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      slug: data.slug,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      quizData: data.quizData,
    },
  })

  return Response.json(category)
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Missing category id' }, { status: 400 })
  }

  // Check if any tenants are using this category
  const tenantsCount = await prisma.tenant.count({
    where: { categoryId: id },
  })

  if (tenantsCount > 0) {
    return Response.json(
      { error: `Cannot delete: ${tenantsCount} tenant(s) are using this category` },
      { status: 409 }
    )
  }

  await prisma.category.delete({ where: { id } })

  return Response.json({ success: true })
}
