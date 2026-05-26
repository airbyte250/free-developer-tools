'use client'

import { useState, useCallback, useEffect } from 'react'
import Footer from '@/components/Footer'
import { GoTilesImage } from '@/components/GoTilesImage'

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

export default function RandomQuizEngine({ questions, categoryTitle, customBannerCode, article, quizSlug, initialStep }: RandomQuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStep || 0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const totalQuestions = questions.length
  const currentQuestion = questions[currentIndex]

  // Base path for URL navigation
  const basePath = quizSlug ? `/quiz/${quizSlug}` : '/quiz'

  // Update URL on each question change (triggers fresh ad impressions)
  useEffect(() => {
    if (showResult) {
      window.history.pushState({}, '', `${basePath}/result`)
    } else if (currentIndex === 0) {
      window.history.replaceState({}, '', basePath)
    } else {
      window.history.pushState({}, '', `${basePath}/${currentIndex + 1}`)
    }
  }, [currentIndex, showResult, basePath])

  const handleAnswer = useCallback((optionIndex: number) => {
    if (selectedOption !== null) return
    setSelectedOption(optionIndex)
    const newAnswers = [...answers, optionIndex]
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1)
        setSelectedOption(null)
      } else {
        setShowResult(true)
      }
    }, 800)
  }, [selectedOption, answers, currentIndex, totalQuestions])

  const correctCount = answers.filter((ans, i) => ans === questions[i]?.correctAnswer).length
  const scorePercent = Math.round((correctCount / totalQuestions) * 100)

  // Option button colors (vibrant borders for dark theme)
  const optionBorderColors = [
    'border-cyan-400',
    'border-yellow-400',
    'border-emerald-400',
    'border-pink-400',
    'border-orange-400',
  ]

  const optionGlowColors = [
    'shadow-cyan-400/30',
    'shadow-yellow-400/30',
    'shadow-emerald-400/30',
    'shadow-pink-400/30',
    'shadow-orange-400/30',
  ]

  // Result page
  if (showResult) {
    const getScoreMessage = () => {
      if (scorePercent === 100) return 'Perfect Score! You are an expert!'
      if (scorePercent >= 80) return 'Excellent! You have strong knowledge in this area.'
      if (scorePercent >= 60) return 'Good job! You have a solid understanding.'
      if (scorePercent >= 40) return 'Not bad! There is room for improvement.'
      return 'Keep learning! Practice makes perfect.'
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0020] via-[#1a0040] to-[#0d0030] pb-16">
        {customBannerCode && (
          <div className="mx-auto max-w-2xl px-4 pt-4">
            <div dangerouslySetInnerHTML={{ __html: customBannerCode }} />
          </div>
        )}
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
          {/* Score Card */}
          <div className="overflow-hidden rounded-2xl border border-purple-500/30 bg-white/5 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
            <div className="px-6 py-10 text-center">
              {/* Trophy Icon */}
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30">
                <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-white md:text-4xl">Quiz Complete!</h2>
              <p className="mt-2 text-lg text-purple-200">{getScoreMessage()}</p>

              {/* Score */}
              <div className="mx-auto mt-6 max-w-xs rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
                <p className="text-5xl font-black text-cyan-300">{correctCount}/{totalQuestions}</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-cyan-400">{scorePercent}% Score</p>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href={basePath}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-center text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40 active:scale-[0.97]"
                >
                  Play Again
                </a>
                <a
                  href="/"
                  className="rounded-xl border-2 border-purple-400/50 bg-purple-500/10 px-8 py-4 text-center text-sm font-bold uppercase tracking-wide text-purple-200 transition-all hover:border-purple-400 hover:bg-purple-500/20"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>

          {/* Article below result */}
          {article && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-purple-500/20 bg-white/5 px-6 py-8 backdrop-blur-xl md:px-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-cyan-300">Expert Guide</h3>
              </div>
              <div
                className="prose prose-sm max-w-none prose-headings:text-purple-200 prose-h2:text-base prose-h2:font-bold prose-h3:text-sm prose-h3:font-semibold prose-p:leading-relaxed prose-p:text-gray-300 prose-li:text-gray-300"
                dangerouslySetInnerHTML={{ __html: article }}
              />
            </div>
          )}
        </div>
        <Footer />
      </div>
    )
  }

  // Quiz question page
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0020] via-[#1a0040] to-[#0d0030] pb-16">
      {/* Banner Ad 1: Header (very top) */}
      {customBannerCode && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <div dangerouslySetInnerHTML={{ __html: customBannerCode }} />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        {/* Quiz Header */}
        <div className="mb-6 text-center md:mb-8">
          <div className="mb-3 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 md:text-sm">
              {categoryTitle || 'Quiz'}
            </span>
          </div>
        </div>

        {/* Go Tiles Image (video thumbnail with play button) - above progress bar */}
        <GoTilesImage />

        {/* Progress */}
        <div className="mb-6 md:mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-purple-300">Question {currentIndex + 1} of {totalQuestions}</span>
            <span className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-xs font-bold text-white shadow-md shadow-cyan-500/30">
              {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transition-all duration-700 ease-out"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Banner Ad 2: Just above quiz question */}
        {customBannerCode && (
          <div className="mb-4">
            <div dangerouslySetInnerHTML={{ __html: customBannerCode }} />
          </div>
        )}

        {/* Question Card */}
        <div className="overflow-hidden rounded-2xl border border-purple-500/30 bg-white/5 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
          <div className="p-6 md:p-8">
            <h2 className="mb-6 text-xl font-extrabold leading-snug text-white md:mb-8 md:text-2xl">
              {currentQuestion?.question}
            </h2>

            <div className="space-y-3 md:space-y-4">
              {currentQuestion?.options.map((option, idx) => {
                const isSelected = selectedOption === idx
                const isCorrect = idx === currentQuestion.correctAnswer
                const showFeedback = selectedOption !== null
                const borderColor = optionBorderColors[idx % optionBorderColors.length]
                const glowColor = optionGlowColors[idx % optionGlowColors.length]

                let btnClass = `border-2 ${borderColor} bg-white/5 text-white hover:bg-white/10 hover:shadow-lg ${glowColor}`
                if (showFeedback && isCorrect) {
                  btnClass = 'border-2 border-emerald-400 bg-emerald-500/30 text-white shadow-lg shadow-emerald-500/30'
                } else if (showFeedback && isSelected && !isCorrect) {
                  btnClass = 'border-2 border-red-400 bg-red-500/30 text-white shadow-lg shadow-red-500/30'
                } else if (isSelected) {
                  btnClass = `border-2 ${borderColor} bg-white/20 text-white shadow-lg ${glowColor}`
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full rounded-xl p-4 text-left transition-all duration-200 active:scale-[0.97] md:p-5 ${btnClass} disabled:cursor-default`}
                  >
                    <span className="text-sm font-bold uppercase tracking-wide md:text-base">
                      {String.fromCharCode(65 + idx)}. {option}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Article below quiz */}
        {article && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-purple-500/20 bg-white/5 px-6 py-8 backdrop-blur-xl md:px-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
                <svg className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-cyan-300">Expert Guide</h3>
            </div>
            <div
              className="prose prose-sm max-w-none prose-headings:text-purple-200 prose-h2:text-base prose-h2:font-bold prose-h3:text-sm prose-h3:font-semibold prose-p:leading-relaxed prose-p:text-gray-300 prose-li:text-gray-300"
              dangerouslySetInnerHTML={{ __html: article }}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
