import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import QuizEngine from '@/components/QuizEngine'

export default async function QuizSlugPage({ params }: { params: Promise<{ slug: string }> }) {
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
  const selectedQuiz = quizzes.find(q => q.slug === slug)

  if (!selectedQuiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quiz Not Found</h1>
          <p className="mt-2 text-gray-600">The requested quiz does not exist.</p>
          <a href="/quiz" className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            View All Quizzes
          </a>
        </div>
      </div>
    )
  }

  const tenantPayload = {
    adClientId: config.adClientId,
    bannerSlotId: config.bannerSlotId,
    interstitialSlotId: config.interstitialSlotId,
    anchorSlotId: config.anchorSlotId,
    analyticsId: config.analyticsId,
    quiz: selectedQuiz,
    metaTitle: config.category.metaTitle,
    categorySlug: config.category.slug,
  }

  return <QuizEngine tenantPayload={tenantPayload} initialStep={1} />
}
