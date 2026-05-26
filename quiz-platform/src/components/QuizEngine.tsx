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
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

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

  useEffect(() => {
    setSelectedOption(null)
  }, [currentStep])

  const handleAnswer = useCallback((option: string) => {
    setSelectedOption(option)
    setAnswers(prev => ({ ...prev, [currentStep]: option }))

    setTimeout(() => {
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
    }, 400)
  }, [currentStep, totalSteps, router, quizSlug])

  // Step 4 - Interstitial
  if (currentStep === 4 || isAnalyzing) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            {/* Animated loader */}
            <div className="relative mx-auto mb-8 h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-indigo-50 animate-pulse" />
              <div className="absolute inset-4 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:text-3xl">
              Analyzing Your Responses...
            </h2>
            <p className="mb-8 text-sm text-gray-500 md:text-base">
              Processing against 10,000+ enterprise benchmarks
            </p>

            {/* Progress */}
            <div className="mx-auto max-w-xs">
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" style={{ width: '75%' }} />
              </div>
              <p className="mt-2 text-xs text-gray-400">Almost done...</p>
            </div>

            {tenantPayload && mounted && (
              <div className="mt-10">
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

  // Result page
  if (isResult) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
          {/* Result Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            {/* Top gradient banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-8 text-center md:py-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm md:h-20 md:w-20">
                <svg className="h-8 w-8 text-white md:h-10 md:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-white md:text-3xl">Assessment Complete!</h2>
              <p className="mt-2 text-sm text-white/80 md:text-base">Your personalized results are ready</p>
            </div>

            <div className="p-6 md:p-8">
              <p className="mb-6 text-center text-sm leading-relaxed text-gray-600 md:text-base">
                {quiz?.resultLogic.message || 'Based on your enterprise profile, you qualify for our Premium tier with significantly higher ROI potential.'}
              </p>

              {/* Score */}
              <div className="mx-auto mb-6 max-w-xs rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 text-center">
                <p className="text-3xl font-extrabold text-amber-600 md:text-4xl">87/100</p>
                <p className="mt-1 text-xs font-medium text-amber-700">Top 12% of Assessed Enterprises</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => {
                    setAnswers({})
                    router.push(`/quiz/${quizSlug}`)
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] sm:w-auto md:px-8 md:text-base"
                >
                  Retake Assessment
                </button>
                <a href="/quiz" className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-center text-sm font-bold text-gray-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98] sm:w-auto md:px-8 md:text-base">
                  Browse All Quizzes
                </a>
              </div>
            </div>
          </div>

          {/* Mid Ad */}
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

          {/* Article */}
          {quiz?.article && (
            <article className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl md:mt-12">
              <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 md:px-8 md:py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800 md:text-base">Expert Guide</span>
                </div>
              </div>
              <div className="p-5 md:p-8">
                <div
                  className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-600 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline md:prose-base"
                  dangerouslySetInnerHTML={{ __html: quiz.article }}
                />
              </div>
            </article>
          )}

          <BottomBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        </div>
        <Footer />
        <AnchorAd tenantPayload={tenantPayload} mounted={mounted} />
      </div>
    )
  }

  const stepData = quiz?.steps.find(s => s.step === currentStep)
  const optionColors = [
    'bg-gradient-to-r from-blue-500 to-indigo-600',
    'bg-gradient-to-r from-emerald-500 to-teal-600',
    'bg-gradient-to-r from-orange-500 to-amber-600',
    'bg-gradient-to-r from-purple-500 to-pink-600',
    'bg-gradient-to-r from-rose-500 to-red-600',
  ]

  // Main quiz step page
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />

      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        {/* Quiz Header */}
        <div className="mb-6 text-center md:mb-8">
          <div className="mb-3 inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 md:text-sm">
              {quiz?.title || 'Assessment'}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-600">Question {currentStep} of {totalSteps}</span>
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="p-6 md:p-8">
            <h2 className="mb-6 text-xl font-extrabold leading-snug text-gray-900 md:mb-8 md:text-2xl">
              {stepData?.question || `Question ${currentStep}`}
            </h2>

            <div className="space-y-3 md:space-y-4">
              {(stepData?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => {
                const isSelected = selectedOption === option
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className={`w-full rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] md:p-5 ${
                      isSelected
                        ? `${optionColors[idx % optionColors.length]} shadow-lg text-white`
                        : 'border-2 border-gray-200 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md'
                    }`}
                  >
                    <span className={`text-sm font-bold md:text-base ${isSelected ? 'text-white' : ''}`}>
                      {option}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Article */}
        {quiz?.article && (
          <article className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl md:mt-12">
            <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 md:px-8 md:py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800 md:text-base">Expert Guide</span>
              </div>
            </div>
            <div className="p-5 md:p-8">
              <div
                className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-600 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline md:prose-base"
                dangerouslySetInnerHTML={{ __html: quiz.article }}
              />
            </div>
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
    <div className="mt-6 w-full rounded-xl bg-gray-100 py-2 text-center md:mt-8">
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 py-1 text-center shadow-2xl backdrop-blur-sm">
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
      </div>
    }>
      <QuizContent tenantPayload={tenantPayload} initialStep={initialStep} />
    </Suspense>
  )
}
