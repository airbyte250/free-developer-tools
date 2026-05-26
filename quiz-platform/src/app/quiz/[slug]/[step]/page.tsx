import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import RandomQuizEngine from '@/components/RandomQuizEngine'

interface PageProps {
  params: Promise<{ slug: string; step: string }>
}

export default async function QuizStepPage({ params }: PageProps) {
  const { slug, step } = await params
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
  const targetQuiz = quizzes.find((q: { slug: string }) => q.slug === slug)

  let selectedQuestions: { question: string; options: string[]; correctAnswer: number }[]
  let article: string | null

  if (targetQuiz) {
    const quizQuestions = targetQuiz.steps.map((s: { question: string; options: string[]; correctAnswer?: number }) => ({
      question: s.question,
      options: s.options,
      correctAnswer: s.correctAnswer ?? 0,
    }))
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5)
    selectedQuestions = shuffled.slice(0, 5)
    article = targetQuiz.article || null
  } else {
    const allQuestions: { question: string; options: string[]; correctAnswer: number }[] = []
    for (const quiz of quizzes) {
      for (const s of quiz.steps) {
        allQuestions.push({ question: s.question, options: s.options, correctAnswer: s.correctAnswer ?? 0 })
      }
    }
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    selectedQuestions = shuffled.slice(0, 5)
    const quizzesWithArticles = quizzes.filter((q: { article: string }) => q.article)
    article = quizzesWithArticles.length > 0
      ? quizzesWithArticles[Math.floor(Math.random() * quizzesWithArticles.length)].article
      : null
  }

  const stepNum = parseInt(step, 10)
  const initialStep = isNaN(stepNum) ? 0 : Math.max(0, stepNum - 1)

  return (
    <RandomQuizEngine
      questions={selectedQuestions}
      categoryTitle={config.category.metaTitle}
      customBannerCode={config.customBannerCode}
      quizBannerCode={config.quizBannerCode}
      headerScript={config.headerScript}
      article={article}
      quizSlug={slug}
      initialStep={initialStep}
    />
  )
}
