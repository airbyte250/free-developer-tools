import { prisma } from './prisma'
import { redis } from './redis'

export interface TenantConfig {
  id: string
  hostname: string
  status: string
  categoryId: string
  adClientId: string | null
  bannerSlotId: string | null
  interstitialSlotId: string | null
  anchorSlotId: string | null
  analyticsId: string | null
  headerScript: string | null
  customBannerCode: string | null
  category: {
    id: string
    slug: string
    metaTitle: string
    metaDescription: string
    quizData: QuizCategoryData
  }
}

export interface QuizStep {
  step: number
  question: string
  options: string[]
}

export interface QuizItem {
  slug: string
  title: string
  description: string
  article: string
  steps: QuizStep[]
  resultLogic: {
    type: string
    message: string
  }
}

export interface QuizCategoryData {
  quizzes: QuizItem[]
}

// Legacy single-quiz format support
export interface QuizData {
  title: string
  steps: QuizStep[]
  resultLogic: {
    type: string
    message: string
  }
}

const CACHE_TTL = 300 // 5 minutes

export async function getTenantConfig(hostname: string): Promise<TenantConfig | null> {
  const cacheKey = `tenant:${hostname}`

  // Try Redis cache first
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch {
    // Redis unavailable, fall through to DB
  }

  // Fetch from database
  const tenant = await prisma.tenant.findUnique({
    where: { hostname },
    include: {
      category: true,
    },
  })

  if (!tenant || tenant.status.toUpperCase() !== 'ACTIVE') {
    return null
  }

  const rawQuizData = tenant.category.quizData as unknown as QuizCategoryData | QuizData

  // Support both new multi-quiz format and legacy single-quiz format
  let quizData: QuizCategoryData
  if ('quizzes' in rawQuizData) {
    quizData = rawQuizData
  } else {
    // Convert legacy single quiz to new format
    const legacy = rawQuizData as QuizData
    quizData = {
      quizzes: [{
        slug: tenant.category.slug,
        title: legacy.title,
        description: tenant.category.metaDescription,
        article: '',
        steps: legacy.steps,
        resultLogic: legacy.resultLogic,
      }],
    }
  }

  const config: TenantConfig = {
    id: tenant.id,
    hostname: tenant.hostname,
    status: tenant.status,
    categoryId: tenant.categoryId,
    adClientId: tenant.adClientId,
    bannerSlotId: tenant.bannerSlotId,
    interstitialSlotId: tenant.interstitialSlotId,
    anchorSlotId: tenant.anchorSlotId,
    analyticsId: tenant.analyticsId,
    headerScript: tenant.headerScript,
    customBannerCode: tenant.customBannerCode,
    category: {
      id: tenant.category.id,
      slug: tenant.category.slug,
      metaTitle: tenant.category.metaTitle,
      metaDescription: tenant.category.metaDescription,
      quizData,
    },
  }

  // Cache in Redis
  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(config))
  } catch {
    // Redis unavailable, continue without cache
  }

  return config
}

export async function invalidateTenantCache(hostname: string): Promise<void> {
  try {
    await redis.del(`tenant:${hostname}`)
  } catch {
    // Redis unavailable
  }
}
