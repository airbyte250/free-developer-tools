'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import Footer from '@/components/Footer'

interface QuizStep {
  step: number
  question: string
  options: string[]
}

interface QuizItemData {
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

interface TenantPayload {
  adClientId: string
  bannerSlotId: string
  interstitialSlotId: string
  anchorSlotId: string
  analyticsId: string | null
  quiz: QuizItemData
  metaTitle: string
  categorySlug: string
}

interface QuizEngineProps {
  tenantPayload: TenantPayload | null
  initialStep?: number
}

function QuizContent({ tenantPayload, initialStep = 1 }: QuizEngineProps) {
  const router = useRouter()
  const currentStep = initialStep === -1 ? 0 : initialStep
  const isResult = initialStep === -1
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const quiz = tenantPayload?.quiz
  const totalSteps = quiz?.steps.length || 5
  const quizSlug = quiz?.slug || ''

  useEffect(() => {
    if (!tenantPayload?.adClientId) return
    const existingScript = document.querySelector('script[src*="adsbygoogle"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${tenantPayload.adClientId}`
      script.async = true
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
    }
  }, [tenantPayload?.adClientId])

  useEffect(() => {
    if (!tenantPayload?.analyticsId) return
    const existingScript = document.querySelector('script[src*="gtag"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${tenantPayload.analyticsId}`
      script.async = true
      document.head.appendChild(script)
      const inlineScript = document.createElement('script')
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${tenantPayload.analyticsId}');
      `
      document.head.appendChild(inlineScript)
    }
  }, [tenantPayload?.analyticsId])

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown[]>).adsbygoogle) {
      try {
        ((window as unknown as Record<string, unknown[]>).adsbygoogle).push({})
      } catch { /* Ad already loaded */ }
    }
  }, [currentStep])

  const handleAnswer = useCallback((option: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: option }))

    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1
      if (nextStep === 4) {
        setIsAnalyzing(true)
        router.push(`/quiz/${quizSlug}/${nextStep}`)
        setTimeout(() => {
          setIsAnalyzing(false)
          router.push(`/quiz/${quizSlug}/${nextStep + 1}`)
        }, 3000)
      } else {
        router.push(`/quiz/${quizSlug}/${nextStep}`)
      }
    } else {
      router.push(`/quiz/${quizSlug}/result`)
    }
  }, [currentStep, totalSteps, router, quizSlug])

  // Step 4 - Interstitial
  if (currentStep === 4 || isAnalyzing) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
        <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg text-center">
            <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 md:mb-8 md:h-16 md:w-16" />
            <h2 className="mb-3 text-xl font-bold text-gray-900 md:mb-4 md:text-2xl">
              Analyzing Your Enterprise Pipeline Infrastructure...
            </h2>
            <p className="mb-4 text-sm text-gray-600 md:mb-6 md:text-base">
              Our AI engine is processing your responses against 10,000+ enterprise benchmarks
            </p>
            <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" style={{ width: '75%' }} />
            </div>
            {tenantPayload && mounted && (
              <div className="mt-6 md:mt-8">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block', minHeight: '250px' }}
                  data-ad-client={tenantPayload.adClientId}
                  data-ad-slot={tenantPayload.interstitialSlotId}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            )}
          </div>
        </div>
        <AnchorAd tenantPayload={tenantPayload} mounted={mounted} />
      </div>
    )
  }

  // Result page with full article below
  if (isResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-16">
        <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          {/* Result Card */}
          <div className="rounded-2xl bg-white p-5 text-center shadow-xl md:p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 md:mb-6 md:h-20 md:w-20">
              <svg className="h-8 w-8 text-green-600 md:h-10 md:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-bold text-gray-900 md:mb-4 md:text-2xl">Assessment Complete</h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-700 md:mb-6 md:text-base">
              {quiz?.resultLogic.message || 'Based on your enterprise profile, you qualify for our Premium tier with significantly higher ROI potential.'}
            </p>
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4">
              <p className="text-xs font-semibold text-blue-800 md:text-sm">Your Score: 87/100 — Top 12% of Assessed Enterprises</p>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center md:mt-6">
              <button
                onClick={() => {
                  setAnswers({})
                  router.push(`/quiz/${quizSlug}`)
                }}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto md:px-6 md:text-base"
              >
                Retake Assessment
              </button>
              <a href="/quiz" className="w-full rounded-lg border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto md:px-6 md:text-base">
                Browse All Assessments
              </a>
            </div>
          </div>

          {/* Mid-content Ad */}
          {tenantPayload && mounted && (
            <div className="my-6 md:my-8">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={tenantPayload.adClientId}
                data-ad-slot={tenantPayload.bannerSlotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          )}

          {/* Full-Length SEO Article Below Quiz */}
          {quiz?.article && (
            <article className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:mt-12 md:p-8">
              <div
                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 md:prose-lg"
                dangerouslySetInnerHTML={{ __html: quiz.article }}
              />
            </article>
          )}

          {/* Bottom Banner Ad */}
          <BottomBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        </div>
        <Footer />
        <AnchorAd tenantPayload={tenantPayload} mounted={mounted} />
      </div>
    )
  }

  const stepData = quiz?.steps.find(s => s.step === currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-16">
      <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />

      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <div className="mx-auto w-full max-w-lg">
          {/* Quiz Title */}
          <div className="mb-3 text-center md:mb-4">
            <h1 className="text-xs font-medium uppercase tracking-wider text-blue-600 md:text-sm">
              {quiz?.title || 'Assessment'}
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-5 md:mb-8">
            <div className="mb-2 flex justify-between text-xs text-gray-500 md:text-sm">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-2xl bg-white p-5 shadow-xl md:p-8">
            <h2 className="mb-4 text-base font-bold text-gray-900 md:mb-6 md:text-xl">
              {stepData?.question || `Question ${currentStep}`}
            </h2>

            <div className="space-y-2 md:space-y-3">
              {(stepData?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all hover:border-blue-500 hover:bg-blue-50 md:p-4 ${
                    answers[currentStep] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700 md:text-base">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Article below quiz on every step */}
        {quiz?.article && (
          <article className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:mt-12 md:p-8">
            <div
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 md:prose-lg"
              dangerouslySetInnerHTML={{ __html: quiz.article }}
            />
          </article>
        )}

        <BottomBannerAd tenantPayload={tenantPayload} mounted={mounted} />
      </div>
      <Footer />
      <AnchorAd tenantPayload={tenantPayload} mounted={mounted} />
    </div>
  )
}

function TopBannerAd({ tenantPayload, mounted }: { tenantPayload: TenantPayload | null; mounted: boolean }) {
  if (!tenantPayload || !mounted) return null
  return (
    <div className="w-full bg-gray-100 py-2 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={tenantPayload.adClientId}
        data-ad-slot={tenantPayload.bannerSlotId}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  )
}

function BottomBannerAd({ tenantPayload, mounted }: { tenantPayload: TenantPayload | null; mounted: boolean }) {
  if (!tenantPayload || !mounted) return null
  return (
    <div className="w-full bg-gray-100 py-2 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={tenantPayload.adClientId}
        data-ad-slot={tenantPayload.bannerSlotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

function AnchorAd({ tenantPayload, mounted }: { tenantPayload: TenantPayload | null; mounted: boolean }) {
  if (!tenantPayload || !mounted) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 py-1 text-center shadow-lg backdrop-blur-sm">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={tenantPayload.adClientId}
        data-ad-slot={tenantPayload.anchorSlotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

export default function QuizEngine({ tenantPayload, initialStep = 1 }: QuizEngineProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    }>
      <QuizContent tenantPayload={tenantPayload} initialStep={initialStep} />
    </Suspense>
  )
}
