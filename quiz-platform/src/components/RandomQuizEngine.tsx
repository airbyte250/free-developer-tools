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
    'shadow-cyan-400/20',
    'shadow-yellow-400/20',
    'shadow-emerald-400/20',
    'shadow-pink-400/20',
    'shadow-orange-400/20',
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
      <div className="min-h-screen bg-gradient-to-br from-[#1a1145] via-[#2d1b69] to-[#1e1250] pb-16">
        {/* Ad: 336x280 top */}
        {customBannerCode && (
          <div className="flex justify-center px-2 pt-3">
            <div className="w-[336px] max-w-full" dangerouslySetInnerHTML={{ __html: customBannerCode }} />
          </div>
        )}
        <div className="mx-auto max-w-md px-3 py-6">
          {/* Score Card */}
          <div className="overflow-hidden rounded-2xl border border-indigo-400/30 bg-white/10 shadow-xl backdrop-blur-md">
            <div className="px-5 py-8 text-center">
              {/* Trophy */}
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30">
                <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Quiz Complete!</h2>
              <p className="mt-1 text-sm text-indigo-200">{getScoreMessage()}</p>

              {/* Score */}
              <div className="mx-auto mt-4 w-fit rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-8 py-3">
                <p className="text-4xl font-black text-cyan-300">{correctCount}/{totalQuestions}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">{scorePercent}%</p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={basePath}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-center text-sm font-bold uppercase text-white shadow-lg shadow-cyan-500/20"
                >
                  Play Again
                </a>
                <a
                  href="/"
                  className="rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-6 py-3 text-center text-sm font-bold text-indigo-200"
                >
                  Home
                </a>
              </div>
            </div>
          </div>

          {/* Article */}
          {article && (
            <div className="mt-4 rounded-2xl border border-indigo-400/20 bg-white/5 px-4 py-6 backdrop-blur-md">
              <h3 className="mb-3 text-sm font-bold text-cyan-300">Expert Guide</h3>
              <div
                className="prose prose-sm max-w-none prose-headings:text-indigo-200 prose-h2:text-sm prose-h2:font-bold prose-h3:text-xs prose-h3:font-semibold prose-p:text-xs prose-p:leading-relaxed prose-p:text-gray-300 prose-li:text-xs prose-li:text-gray-300"
                dangerouslySetInnerHTML={{ __html: article }}
              />
            </div>
          )}
        </div>
        <Footer />
      </div>
    )
  }

  // Quiz question page - compact mobile layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1145] via-[#2d1b69] to-[#1e1250] pb-16">
      {/* Ad Slot 1: 336x280 (top) */}
      {customBannerCode && (
        <div className="flex justify-center px-2 pt-3">
          <div className="w-[336px] max-w-full" dangerouslySetInnerHTML={{ __html: customBannerCode }} />
        </div>
      )}

      <div className="mx-auto max-w-md px-3 py-3">
        {/* Go Tiles Image (video player lookalike) */}
        <GoTilesImage />

        {/* Ad Slot 2: 336x280 (below video, above quiz) */}
        {customBannerCode && (
          <div className="my-3 flex justify-center">
            <div className="w-[336px] max-w-full" dangerouslySetInnerHTML={{ __html: customBannerCode }} />
          </div>
        )}

        {/* Progress bar (minimal) */}
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-cyan-300">{currentIndex + 1}/{totalQuestions}</span>
        </div>

        {/* Question Card - compact 2 lines */}
        <div className="rounded-2xl border border-indigo-400/30 bg-white/10 p-4 shadow-xl backdrop-blur-md">
          <h2 className="mb-4 text-base font-bold leading-tight text-white md:text-lg">
            {currentQuestion?.question}
          </h2>

          <div className="space-y-2">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === currentQuestion.correctAnswer
              const showFeedback = selectedOption !== null
              const borderColor = optionBorderColors[idx % optionBorderColors.length]
              const glowColor = optionGlowColors[idx % optionGlowColors.length]

              let btnClass = `border ${borderColor} bg-white/5 text-white hover:bg-white/10`
              if (showFeedback && isCorrect) {
                btnClass = 'border-2 border-emerald-400 bg-emerald-500/20 text-white shadow-md shadow-emerald-500/20'
              } else if (showFeedback && isSelected && !isCorrect) {
                btnClass = 'border-2 border-red-400 bg-red-500/20 text-white shadow-md shadow-red-500/20'
              } else if (isSelected) {
                btnClass = `border-2 ${borderColor} bg-white/15 text-white shadow-md ${glowColor}`
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

        {/* Article below quiz */}
        {article && (
          <div className="mt-4 rounded-2xl border border-indigo-400/20 bg-white/5 px-4 py-6 backdrop-blur-md">
            <h3 className="mb-3 text-sm font-bold text-cyan-300">Expert Guide</h3>
            <div
              className="prose prose-sm max-w-none prose-headings:text-indigo-200 prose-h2:text-sm prose-h2:font-bold prose-h3:text-xs prose-h3:font-semibold prose-p:text-xs prose-p:leading-relaxed prose-p:text-gray-300 prose-li:text-xs prose-li:text-gray-300"
              dangerouslySetInnerHTML={{ __html: article }}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
