import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { verifyApiAuth } from '@/lib/auth-api'

interface QuizItem {
  slug: string
  title: string
  description: string
  article: string
  steps: { step: number; question: string; options: string[] }[]
  resultLogic: { type: string; message: string }
}

interface QuizData {
  quizzes: QuizItem[]
}

export async function GET(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const categoryId = searchParams.get('categoryId')

  const categories = categoryId
    ? await prisma.category.findMany({ where: { id: categoryId }, orderBy: { slug: 'asc' } })
    : await prisma.category.findMany({ orderBy: { slug: 'asc' } })

  const allQuizzes: { categoryId: string; categorySlug: string; categoryTitle: string; quiz: QuizItem }[] = []

  for (const cat of categories) {
    const data = cat.quizData as unknown as QuizData
    if (data?.quizzes) {
      for (const quiz of data.quizzes) {
        allQuizzes.push({
          categoryId: cat.id,
          categorySlug: cat.slug,
          categoryTitle: cat.metaTitle,
          quiz,
        })
      }
    }
  }

  return Response.json(allQuizzes)
}

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { categoryId, quiz } = body as { categoryId: string; quiz: QuizItem }

  if (!categoryId || !quiz || !quiz.slug || !quiz.title) {
    return Response.json({ error: 'Missing required fields: categoryId, quiz.slug, quiz.title' }, { status: 400 })
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  const data = category.quizData as unknown as QuizData
  const quizzes = data?.quizzes || []

  if (quizzes.some(q => q.slug === quiz.slug)) {
    return Response.json({ error: 'Quiz with this slug already exists in this category' }, { status: 409 })
  }

  quizzes.push({
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description || '',
    article: quiz.article || '',
    steps: quiz.steps || [
      { step: 1, question: 'Question 1?', options: ['Option A', 'Option B', 'Option C', 'Option D'] },
      { step: 2, question: 'Question 2?', options: ['Option A', 'Option B', 'Option C', 'Option D'] },
      { step: 3, question: 'Question 3?', options: ['Option A', 'Option B', 'Option C', 'Option D'] },
      { step: 4, question: 'Loading...', options: [] },
      { step: 5, question: 'Question 4?', options: ['Option A', 'Option B', 'Option C', 'Option D'] },
    ],
    resultLogic: quiz.resultLogic || { type: 'score', message: 'Assessment complete. Your score indicates strong potential for optimization.' },
  })

  await prisma.category.update({
    where: { id: categoryId },
    data: { quizData: JSON.parse(JSON.stringify({ quizzes })) },
  })

  return Response.json({ success: true, quizCount: quizzes.length }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { categoryId, originalSlug, quiz } = body as { categoryId: string; originalSlug: string; quiz: QuizItem }

  if (!categoryId || !originalSlug || !quiz) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  const data = category.quizData as unknown as QuizData
  const quizzes = data?.quizzes || []
  const idx = quizzes.findIndex(q => q.slug === originalSlug)

  if (idx === -1) {
    return Response.json({ error: 'Quiz not found in category' }, { status: 404 })
  }

  quizzes[idx] = {
    slug: quiz.slug || originalSlug,
    title: quiz.title || quizzes[idx].title,
    description: quiz.description ?? quizzes[idx].description,
    article: quiz.article ?? quizzes[idx].article,
    steps: quiz.steps || quizzes[idx].steps,
    resultLogic: quiz.resultLogic || quizzes[idx].resultLogic,
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { quizData: JSON.parse(JSON.stringify({ quizzes })) },
  })

  return Response.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const categoryId = searchParams.get('categoryId')
  const slug = searchParams.get('slug')

  if (!categoryId || !slug) {
    return Response.json({ error: 'Missing categoryId and slug' }, { status: 400 })
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  const data = category.quizData as unknown as QuizData
  const quizzes = (data?.quizzes || []).filter(q => q.slug !== slug)

  await prisma.category.update({
    where: { id: categoryId },
    data: { quizData: JSON.parse(JSON.stringify({ quizzes })) },
  })

  return Response.json({ success: true, quizCount: quizzes.length })
}
