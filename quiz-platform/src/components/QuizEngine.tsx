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
    }, 300)
  }, [currentStep, totalSteps, router, quizSlug])

  // Step 4 - Premium Interstitial
  if (currentStep === 4 || isAnalyzing) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg text-center">
            {/* Animated rings */}
            <div className="relative mx-auto mb-8 h-24 w-24 md:h-28 md:w-28">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
              <div className="absolute inset-2 animate-pulse rounded-full bg-blue-500/30" />
              <div className="absolute inset-4 rounded-full border-4 border-blue-400/50 border-t-blue-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h2 className="mb-3 text-2xl font-bold text-white md:mb-4 md:text-3xl">
              Analyzing Your Responses...
            </h2>
            <p className="mb-6 text-sm text-blue-200/80 md:mb-8 md:text-base">
              Our AI engine is processing your data against 10,000+ enterprise benchmarks
            </p>

            {/* Progress bar */}
            <div className="mx-auto max-w-xs">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-pulse" style={{ width: '75%' }} />
              </div>
              <div className="mt-3 flex justify-between text-xs text-blue-300/60">
                <span>Processing...</span>
                <span>75%</span>
              </div>
            </div>

            {tenantPayload && mounted && (
              <div className="mt-8 md:mt-10">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pb-16">
        <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          {/* Result Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 text-center shadow-2xl backdrop-blur-sm md:p-10">
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-green-200/40 to-emerald-200/40 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/40 blur-3xl" />

            <div className="relative">
              {/* Success icon */}
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 md:mb-6 md:h-24 md:w-24">
                <svg className="h-10 w-10 text-white md:h-12 md:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="mb-3 text-2xl font-extrabold text-gray-900 md:mb-4 md:text-3xl">Assessment Complete</h2>
              <p className="mx-auto mb-5 max-w-xl text-sm leading-relaxed text-gray-600 md:mb-6 md:text-base">
                {quiz?.resultLogic.message || 'Based on your enterprise profile, you qualify for our Premium tier with significantly higher ROI potential.'}
              </p>

              {/* Score badge */}
              <div className="mx-auto mb-6 max-w-sm rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg shadow-blue-500/25 md:mb-8 md:p-5">
                <p className="text-base font-bold text-white md:text-lg">Your Score: 87/100</p>
                <p className="mt-0.5 text-xs text-blue-100 md:text-sm">Top 12% of Assessed Enterprises</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => {
                    setAnswers({})
                    router.push(`/quiz/${quizSlug}`)
                  }}
                  className="group w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] sm:w-auto md:px-8 md:text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 transition-transform group-hover:-rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retake Assessment
                  </span>
                </button>
                <a href="/quiz" className="group w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-center text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98] sm:w-auto md:px-8 md:text-base">
                  <span className="flex items-center justify-center gap-2">
                    Browse All Assessments
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </a>
              </div>
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

          {/* Full-Length SEO Article */}
          {quiz?.article && (
            <article className="mt-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl md:mt-12">
              <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 md:px-8 md:py-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 md:text-base">Expert Guide</span>
                </div>
              </div>
              <div className="p-5 md:p-8">
                <div
                  className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-p:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline md:prose-base md:prose-h2:text-2xl"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pb-16">
      <TopBannerAd tenantPayload={tenantPayload} mounted={mounted} />

      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
        <div className="mx-auto w-full max-w-xl">
          {/* Quiz Header */}
          <div className="mb-5 text-center md:mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 md:text-sm">
                {quiz?.title || 'Assessment'}
              </span>
            </div>
          </div>

          {/* Progress Bar - Premium */}
          <div className="mb-6 md:mb-8">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 md:text-sm">Step {currentStep} of {totalSteps}</span>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 md:text-sm">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 shadow-sm transition-all duration-700 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card - Premium Glass */}
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-sm md:p-8">
            {/* Decorative gradient blobs */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100/60 to-indigo-100/60 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-100/40 to-pink-100/40 blur-2xl" />

            <div className="relative">
              <h2 className="mb-5 text-lg font-bold leading-tight text-gray-900 md:mb-7 md:text-2xl">
                {stepData?.question || `Question ${currentStep}`}
              </h2>

              <div className="space-y-3 md:space-y-3.5">
                {(stepData?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className={`group w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] md:p-5 ${
                      selectedOption === option
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                        : 'border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all md:h-9 md:w-9 ${
                        selectedOption === option
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-sm font-medium md:text-base ${
                        selectedOption === option ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {option}
                      </span>
                      {selectedOption === option && (
                        <svg className="ml-auto h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Article below quiz on every step */}
        {quiz?.article && (
          <article className="mt-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl md:mt-12">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 md:px-8 md:py-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700 md:text-base">Expert Guide</span>
              </div>
            </div>
            <div className="p-5 md:p-8">
              <div
                className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-p:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline md:prose-base md:prose-h2:text-2xl"
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
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 py-2 text-center">
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
    <div className="mt-6 w-full rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 py-2 text-center md:mt-8">
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/50 bg-white/95 py-1 text-center shadow-2xl backdrop-blur-md">
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      </div>
    }>
      <QuizContent tenantPayload={tenantPayload} initialStep={initialStep} />
    </Suspense>
  )
}
