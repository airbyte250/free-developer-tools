'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface QuizStep {
  step: number
  question: string
  options: string[]
}

interface QuizData {
  title: string
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
  quizData: QuizData
  metaTitle: string
}

interface QuizEngineProps {
  tenantPayload: TenantPayload | null
}

function QuizContent({ tenantPayload }: QuizEngineProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStep = parseInt(searchParams.get('step') || '1', 10)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const quizData = tenantPayload?.quizData
  const totalSteps = quizData?.steps.length || 5

  // Inject AdSense script on mount
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

  // Inject Analytics
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

  // Fire ad refresh on step change to trigger new auction
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown[]>).adsbygoogle) {
      try {
        ((window as unknown as Record<string, unknown[]>).adsbygoogle).push({})
      } catch {
        // Ad already loaded
      }
    }
  }, [currentStep])

  const handleAnswer = useCallback((option: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: option }))

    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1
      // Step 4 is the interstitial delay step
      if (nextStep === 4) {
        setIsAnalyzing(true)
        router.push(`/quiz?step=${nextStep}`)
        setTimeout(() => {
          setIsAnalyzing(false)
          router.push(`/quiz?step=${nextStep + 1}`)
        }, 3000)
      } else {
        router.push(`/quiz?step=${nextStep}`)
      }
    } else {
      setShowResult(true)
      router.push('/quiz?step=result')
    }
  }, [currentStep, totalSteps, router])

  // Step 4 - Interstitial loading screen
  if (currentStep === 4 || isAnalyzing) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBannerAd tenantPayload={tenantPayload} />
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="w-full max-w-lg text-center">
            <div className="mx-auto mb-8 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Analyzing Your Enterprise Pipeline Infrastructure...
            </h2>
            <p className="mb-6 text-gray-600">
              Our AI engine is processing your responses against 10,000+ enterprise benchmarks
            </p>
            <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-pulse rounded-full bg-blue-600" style={{ width: '75%' }} />
            </div>
            {/* Interstitial Ad Slot */}
            {tenantPayload && (
              <div className="mt-8">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client={tenantPayload.adClientId}
                  data-ad-slot={tenantPayload.interstitialSlotId}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            )}
          </div>
        </div>
        <AnchorAd tenantPayload={tenantPayload} />
      </div>
    )
  }

  // Result page
  if (showResult || searchParams.get('step') === 'result') {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBannerAd tenantPayload={tenantPayload} />
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Assessment Complete</h2>
            <p className="mb-6 text-gray-600">
              {quizData?.resultLogic.message || 'Based on your enterprise profile, you qualify for our Premium CRM Automation tier with 47% higher ROI potential.'}
            </p>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">Your Score: 87/100 — Top 12% of Enterprises</p>
            </div>
            <button
              onClick={() => {
                setAnswers({})
                setShowResult(false)
                router.push('/quiz?step=1')
              }}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              Retake Assessment
            </button>
          </div>
        </div>
        <BottomBannerAd tenantPayload={tenantPayload} />
        <AnchorAd tenantPayload={tenantPayload} />
      </div>
    )
  }

  const stepData = quizData?.steps.find(s => s.step === currentStep)

  return (
    <div className="flex min-h-screen flex-col">
      <TopBannerAd tenantPayload={tenantPayload} />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm text-gray-500">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              {stepData?.question || `Question ${currentStep}`}
            </h2>

            <div className="space-y-3">
              {(stepData?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50 ${
                    answers[currentStep] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="font-medium text-gray-700">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomBannerAd tenantPayload={tenantPayload} />
      <AnchorAd tenantPayload={tenantPayload} />
    </div>
  )
}

function TopBannerAd({ tenantPayload }: { tenantPayload: TenantPayload | null }) {
  if (!tenantPayload) return null
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

function BottomBannerAd({ tenantPayload }: { tenantPayload: TenantPayload | null }) {
  if (!tenantPayload) return null
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

function AnchorAd({ tenantPayload }: { tenantPayload: TenantPayload | null }) {
  if (!tenantPayload) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={tenantPayload.adClientId}
        data-ad-slot={tenantPayload.anchorSlotId}
        data-ad-format="autorelaxed"
        data-full-width-responsive="true"
      />
    </div>
  )
}

export default function QuizEngine({ tenantPayload }: QuizEngineProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    }>
      <QuizContent tenantPayload={tenantPayload} />
    </Suspense>
  )
}
