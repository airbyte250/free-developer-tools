'use client'

import { useState, useCallback, useEffect } from 'react'
import Footer from '@/components/Footer'
import { GoTilesImage } from '@/components/GoTilesImage'
import AdSlot from '@/components/AdSlot'

interface Question {
  question: string
  options: string[]
  correctAnswer: number
}

interface RandomQuizEngineProps {
  questions: Question[]
  categoryTitle: string
  customBannerCode: string | null
  headerScript: string | null
  article: string | null
  quizSlug?: string
  initialStep?: number
}

function getSessionKey(slug: string) {
  return `quiz_${slug}`
}

export default function RandomQuizEngine({ questions: serverQuestions, categoryTitle, customBannerCode, headerScript, article, quizSlug, initialStep }: RandomQuizEngineProps) {
  const basePath = quizSlug ? `/quiz/${quizSlug}` : '/quiz'
  const stepIndex = initialStep || 0

  // Load questions from sessionStorage (for consistent questions across page loads)
  const [questions, setQuestions] = useState<Question[]>(serverQuestions)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [storedArticle, setStoredArticle] = useState<string | null>(article)

  useEffect(() => {
    const key = getSessionKey(quizSlug || 'default')
    const stored = sessionStorage.getItem(key)

    if (stepIndex === 0 && !window.location.pathname.includes('/result')) {
      // First step: store fresh questions and article
      sessionStorage.setItem(key, JSON.stringify({ questions: serverQuestions, answers: [], article }))
      setQuestions(serverQuestions)
      setStoredArticle(article)
    } else if (stored) {
      // Subsequent steps: read from sessionStorage
      const data = JSON.parse(stored)
      setQuestions(data.questions)
      setAnswers(data.answers || [])
      setStoredArticle(data.article || article)
      if (window.location.pathname.includes('/result')) {
        setShowResult(true)
      }
    }
  }, [])

  const totalQuestions = questions.length
  const currentQuestion = questions[stepIndex]

  const handleAnswer = useCallback((optionIndex: number) => {
    if (selectedOption !== null) return
    setSelectedOption(optionIndex)

    // Save answer to sessionStorage
    const key = getSessionKey(quizSlug || 'default')
    const stored = sessionStorage.getItem(key)
    const data = stored ? JSON.parse(stored) : { questions: serverQuestions, answers: [], article }
    data.answers = [...(data.answers || []), optionIndex]
    sessionStorage.setItem(key, JSON.stringify(data))

    // Navigate to next page after delay (full page reload = fresh ads)
    setTimeout(() => {
      if (stepIndex < totalQuestions - 1) {
        window.location.href = `${basePath}/${stepIndex + 2}`
      } else {
        window.location.href = `${basePath}/result`
      }
    }, 800)
  }, [selectedOption, stepIndex, totalQuestions, basePath, quizSlug, serverQuestions, article])

  // Result page
  if (showResult) {
    const correctCount = answers.filter((ans, i) => ans === questions[i]?.correctAnswer).length
    const scorePercent = Math.round((correctCount / totalQuestions) * 100)

    const getScoreMessage = () => {
      if (scorePercent === 100) return 'Perfect Score! You are an expert!'
      if (scorePercent >= 80) return 'Excellent! Strong knowledge in this area.'
      if (scorePercent >= 60) return 'Good job! Solid understanding.'
      if (scorePercent >= 40) return 'Not bad! Room for improvement.'
      return 'Keep learning! Practice makes perfect.'
    }

    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        {headerScript && (
          <div className="flex justify-center">
            <div className="w-[336px] max-w-full"><AdSlot code={headerScript} /></div>
          </div>
        )}
        {customBannerCode && (
          <div className="flex justify-center">
            <div className="w-[336px] max-w-full"><AdSlot code={customBannerCode} /></div>
          </div>
        )}
        <div className="mx-auto max-w-md px-3 py-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Quiz Complete!</h2>
              <p className="mt-1 text-sm text-white/80">{getScoreMessage()}</p>
            </div>
            <div className="px-5 py-6 text-center">
              <div className="mx-auto w-fit rounded-xl border-2 border-indigo-100 bg-indigo-50 px-8 py-3">
                <p className="text-4xl font-black text-indigo-700">{correctCount}/{totalQuestions}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">{scorePercent}% Score</p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={basePath}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-center text-sm font-bold uppercase text-white shadow-lg"
                >
                  Play Again
                </a>
                <a
                  href="/"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 text-center text-sm font-bold text-gray-700"
                >
                  Home
                </a>
              </div>
            </div>
          </div>

          {/* Article */}
          {storedArticle && (
            <div className="mt-0 rounded-b-2xl border border-t-0 border-gray-200 bg-white px-4 py-6 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-indigo-700">Expert Guide</h3>
              <div
                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-h2:text-sm prose-h2:font-bold prose-h3:text-xs prose-h3:font-semibold prose-p:text-xs prose-p:leading-relaxed prose-p:text-gray-600 prose-li:text-xs prose-li:text-gray-600"
                dangerouslySetInnerHTML={{ __html: storedArticle }}
              />
            </div>
          )}
        </div>
        <Footer />
      </div>
    )
  }

  const optionColors = [
    { border: 'border-blue-500', bg: 'bg-blue-50', activeBg: 'bg-blue-500', text: 'text-blue-700' },
    { border: 'border-emerald-500', bg: 'bg-emerald-50', activeBg: 'bg-emerald-500', text: 'text-emerald-700' },
    { border: 'border-orange-500', bg: 'bg-orange-50', activeBg: 'bg-orange-500', text: 'text-orange-700' },
    { border: 'border-purple-500', bg: 'bg-purple-50', activeBg: 'bg-purple-500', text: 'text-purple-700' },
    { border: 'border-rose-500', bg: 'bg-rose-50', activeBg: 'bg-rose-500', text: 'text-rose-700' },
  ]

  // Quiz question page - light premium
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header Banner Ad (sabse upar) */}
      {headerScript && (
        <div className="flex justify-center">
          <div className="w-[336px] max-w-full"><AdSlot code={headerScript} /></div>
        </div>
      )}

      <div className="mx-auto max-w-md px-3 py-2">
        {/* Go Tiles Image (video player lookalike) */}
        <GoTilesImage />

        {/* Banner Ad (quiz ke upar) */}
        {customBannerCode && (
          <div className="flex justify-center my-1">
            <div className="w-[336px] max-w-full"><AdSlot code={customBannerCode} /></div>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">{stepIndex + 1}/{totalQuestions}</span>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
          <h2 className="mb-4 text-base font-bold leading-tight text-gray-900 md:text-lg">
            {currentQuestion?.question}
          </h2>

          <div className="space-y-2">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === currentQuestion.correctAnswer
              const showFeedback = selectedOption !== null
              const colors = optionColors[idx % optionColors.length]

              let btnClass = `border ${colors.border} ${colors.bg} ${colors.text} hover:shadow-md`
              if (showFeedback && isCorrect) {
                btnClass = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md'
              } else if (showFeedback && isSelected && !isCorrect) {
                btnClass = 'border-2 border-red-400 bg-red-50 text-red-800 shadow-md'
              } else if (isSelected) {
                btnClass = `border-2 ${colors.border} ${colors.activeBg} text-white shadow-md`
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full rounded-xl px-4 py-3 text-left transition-all duration-200 active:scale-[0.97] ${btnClass} disabled:cursor-default`}
                >
                  <span className="text-sm font-semibold">
                    {String.fromCharCode(65 + idx)}. {option}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Article below quiz - no gap */}
        {storedArticle && (
          <div className="rounded-b-2xl border border-t-0 border-gray-200 bg-white px-4 py-6 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-indigo-700">Expert Guide</h3>
            <div
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-h2:text-sm prose-h2:font-bold prose-h3:text-xs prose-h3:font-semibold prose-p:text-xs prose-p:leading-relaxed prose-p:text-gray-600 prose-li:text-xs prose-li:text-gray-600"
              dangerouslySetInnerHTML={{ __html: storedArticle }}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
