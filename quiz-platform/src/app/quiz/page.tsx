import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import QuizListing from '@/components/QuizListing'

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

  const quizzes = config.category.quizData.quizzes

  return (
    <QuizListing
      quizzes={quizzes.map(q => ({ slug: q.slug, title: q.title, description: q.description }))}
      categoryTitle={config.category.metaTitle}
      categoryDescription={config.category.metaDescription}
      adClientId={config.adClientId || ''}
      bannerSlotId={config.bannerSlotId || ''}
      anchorSlotId={config.anchorSlotId || ''}
    />
  )
}
