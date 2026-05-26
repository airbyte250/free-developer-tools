import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import RandomQuizEngine from '@/components/RandomQuizEngine'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function QuizSlugPage({ params }: PageProps) {
  const { slug } = await params
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const config = await getTenantConfig(hostname)

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Domain Not Configured</h1>
          <p className="mt-2 text-gray-600">This domain has not been set up yet.</p>
        </div>
      </div>
    )
  }

  const quizzes = config.category.quizData.quizzes

  // Find the specific quiz by slug
  const targetQuiz = quizzes.find((q: { slug: string }) => q.slug === slug)

  if (!targetQuiz) {
    notFound()
  }

  // Use questions from this specific quiz
  const quizQuestions = targetQuiz.steps.map((step: { question: string; options: string[]; correctAnswer?: number }) => ({
    question: step.question,
    options: step.options,
    correctAnswer: step.correctAnswer ?? 0,
  }))

  // Shuffle and pick 5 questions from this quiz's pool
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5)
  const selectedQuestions = shuffled.slice(0, 5)

  // Use this quiz's article
  const article = targetQuiz.article || null

  return (
    <RandomQuizEngine
      questions={selectedQuestions}
      categoryTitle={config.category.metaTitle}
      customBannerCode={config.customBannerCode}
      headerScript={config.headerScript}
      article={article}
      quizSlug={slug}
    />
  )
}
