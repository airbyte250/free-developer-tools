import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import RandomQuizEngine from '@/components/RandomQuizEngine'

export const dynamic = 'force-dynamic'

export default async function QuizPage() {
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

  // Collect ALL questions from all quizzes in this category into one pool
  const allQuestions: { question: string; options: string[]; correctAnswer: number }[] = []
  const quizzes = config.category.quizData.quizzes

  for (const quiz of quizzes) {
    for (const step of quiz.steps) {
      allQuestions.push({
        question: step.question,
        options: step.options,
        correctAnswer: step.correctAnswer ?? 0,
      })
    }
  }

  // Randomly select 5 questions (shuffle and pick)
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
  const selectedQuestions = shuffled.slice(0, 5)

  // Pick a random article from available quizzes
  const quizzesWithArticles = quizzes.filter(q => q.article)
  const randomArticle = quizzesWithArticles.length > 0
    ? quizzesWithArticles[Math.floor(Math.random() * quizzesWithArticles.length)].article
    : null

  return (
    <RandomQuizEngine
      questions={selectedQuestions}
      categoryTitle={config.category.metaTitle}
      customBannerCode={config.customBannerCode}
      quizBannerCode={config.quizBannerCode}
      headerScript={config.headerScript}
      article={randomArticle}
    />
  )
}
