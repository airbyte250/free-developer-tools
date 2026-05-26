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

  // Step 4 - Interstitial (dark premium)
  if (currentStep === 4 || isAnalyzing) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            {/* Animated loader */}
            <div className="relative mx-auto mb-8 h-28 w-28">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-20 animate-ping" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-30 animate-pulse" />
              <div className="absolute inset-5 rounded-full border-4 border-transparent border-t-cyan-400 border-r-purple-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-10 w-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              Analyzing Your Responses...
            </h2>
            <p className="mb-8 text-sm text-gray-300 md:text-base">
              Processing against 10,000+ enterprise benchmarks
            </p>

            {/* Progress */}
            <div className="mx-auto max-w-xs">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse" style={{ width: '75%' }} />
              </div>
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
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] pb-16">
        <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
          {/* Result Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md md:p-10">
            {/* Glow effect */}
            <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative">
              {/* Trophy/Success */}
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/40 md:h-24 md:w-24">
                <svg className="h-10 w-10 text-white md:h-12 md:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="mb-3 text-2xl font-extrabold text-white md:text-3xl">Assessment Complete!</h2>
              <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-gray-300 md:text-base">
                {quiz?.resultLogic.message || 'Based on your enterprise profile, you qualify for our Premium tier with significantly higher ROI potential.'}
              </p>

              {/* Score */}
              <div className="mx-auto mb-8 inline-block rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 shadow-lg shadow-amber-500/30">
                <p className="text-2xl font-extrabold text-white md:text-3xl">87/100</p>
                <p className="mt-0.5 text-xs font-medium text-amber-100">Top 12% of Assessed Enterprises</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => {
                    setAnswers({})
                    router.push(`/quiz/${quizSlug}`)
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] sm:w-auto md:px-8 md:text-base"
                >
                  Retake Assessment
                </button>
                <a href="/quiz" className="w-full rounded-xl border-2 border-white/20 bg-white/5 px-6 py-3.5 text-center text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 active:scale-[0.98] sm:w-auto md:px-8 md:text-base">
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
            <article className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md md:mt-12">
              <div className="border-b border-white/10 px-5 py-4 md:px-8 md:py-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-white md:text-base">Expert Guide</span>
                </div>
              </div>
              <div className="p-5 md:p-8">
                <div
                  className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-white prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-p:text-gray-300 prose-a:text-cyan-400 prose-li:text-gray-300 md:prose-base"
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

  // Main quiz step page
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] pb-16">
      <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />

      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        {/* Quiz Header */}
        <div className="mb-6 text-center md:mb-8">
          <h1 className="mb-2 text-lg font-extrabold text-white md:text-xl">
            {quiz?.title || 'Assessment'}
          </h1>
          <p className="text-xs text-gray-400 md:text-sm">
            Question {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i < currentStep
                      ? 'w-8 bg-gradient-to-r from-cyan-400 to-purple-500'
                      : i === currentStep - 1
                      ? 'w-8 bg-gradient-to-r from-cyan-400 to-purple-500'
                      : 'w-4 bg-white/10'
                  }`}
                />
              ))}
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-400">
              {currentStep}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md md:p-8">
          {/* Glow */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative">
            <h2 className="mb-6 text-lg font-bold leading-snug text-white md:mb-8 md:text-2xl">
              {stepData?.question || `Question ${currentStep}`}
            </h2>

            <div className="space-y-3 md:space-y-4">
              {(stepData?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => {
                const isSelected = selectedOption === option
                const colors = [
                  'from-cyan-500 to-blue-600',
                  'from-purple-500 to-indigo-600',
                  'from-emerald-500 to-teal-600',
                  'from-amber-500 to-orange-600',
                  'from-rose-500 to-pink-600',
                ]
                const colorClass = colors[idx % colors.length]

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className={`group w-full rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] md:p-5 ${
                      isSelected
                        ? `bg-gradient-to-r ${colorClass} shadow-lg`
                        : 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span className={`text-sm font-semibold md:text-base ${
                      isSelected ? 'text-white' : 'text-gray-200'
                    }`}>
                      {option}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Article below quiz */}
        {quiz?.article && (
          <article className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md md:mt-12">
            <div className="border-b border-white/10 px-5 py-4 md:px-8 md:py-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-white md:text-base">Expert Guide</span>
              </div>
            </div>
            <div className="p-5 md:p-8">
              <div
                className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-white prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-p:text-gray-300 prose-a:text-cyan-400 prose-li:text-gray-300 md:prose-base"
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
    <div className="w-full bg-black/30 py-2 text-center">
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
    <div className="mt-6 w-full rounded-xl bg-black/20 py-2 text-center md:mt-8">
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1a1a2e]/95 py-1 text-center backdrop-blur-md">
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/30" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />
        </div>
      </div>
    }>
      <QuizContent tenantPayload={tenantPayload} initialStep={initialStep} />
    </Suspense>
  )
}
