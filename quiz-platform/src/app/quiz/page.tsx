import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import QuizEngine from '@/components/QuizEngine'

export default async function QuizPage() {
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const config = await getTenantConfig(hostname)

  const tenantPayload = config
    ? {
        adClientId: config.adClientId,
        bannerSlotId: config.bannerSlotId,
        interstitialSlotId: config.interstitialSlotId,
        anchorSlotId: config.anchorSlotId,
        analyticsId: config.analyticsId,
        quizData: config.category.quizData,
        metaTitle: config.category.metaTitle,
      }
    : null

  return <QuizEngine tenantPayload={tenantPayload} />
}
