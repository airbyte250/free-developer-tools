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
}

export default function RandomQuizEngine({ questions, categoryTitle, customBannerCode, article }: RandomQuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const totalQuestions = questions.length
  const currentQuestion = questions[currentIndex]

  // Update URL on each question change (triggers fresh ad impressions)
  useEffect(() => {
    if (showResult) {
      window.history.pushState({}, '', '/quiz/result')
    } else if (currentIndex === 0) {
      window.history.replaceState({}, '', '/quiz')
    } else {
      window.history.pushState({}, '', `/quiz/${currentIndex + 1}`)
    }
  }, [currentIndex, showResult])

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

  const optionColors = [
    { selected: 'bg-gradient-to-r from-blue-500 to-indigo-600', correct: 'bg-gradient-to-r from-green-500 to-emerald-600', wrong: 'bg-gradient-to-r from-red-500 to-rose-600' },
    { selected: 'bg-gradient-to-r from-emerald-500 to-teal-600', correct: 'bg-gradient-to-r from-green-500 to-emerald-600', wrong: 'bg-gradient-to-r from-red-500 to-rose-600' },
    { selected: 'bg-gradient-to-r from-orange-500 to-amber-600', correct: 'bg-gradient-to-r from-green-500 to-emerald-600', wrong: 'bg-gradient-to-r from-red-500 to-rose-600' },
    { selected: 'bg-gradient-to-r from-purple-500 to-pink-600', correct: 'bg-gradient-to-r from-green-500 to-emerald-600', wrong: 'bg-gradient-to-r from-red-500 to-rose-600' },
    { selected: 'bg-gradient-to-r from-rose-500 to-red-600', correct: 'bg-gradient-to-r from-green-500 to-emerald-600', wrong: 'bg-gradient-to-r from-red-500 to-rose-600' },
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

    const getScoreColor = () => {
      if (scorePercent >= 80) return 'from-green-500 to-emerald-600'
      if (scorePercent >= 60) return 'from-blue-500 to-indigo-600'
      if (scorePercent >= 40) return 'from-orange-500 to-amber-600'
      return 'from-red-500 to-rose-600'
    }

    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        {customBannerCode && (
          <div className="mx-auto max-w-2xl px-4 pt-4">
            <div dangerouslySetInnerHTML={{ __html: customBannerCode }} />
          </div>
        )}
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            {/* Score Header */}
            <div className={`bg-gradient-to-r ${getScoreColor()} px-6 py-10 text-center`}>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-3xl font-extrabold text-white">{correctCount}/{totalQuestions}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white md:text-3xl">Quiz Complete!</h2>
              <p className="mt-2 text-white/90">{getScoreMessage()}</p>
            </div>

            <div className="p-6 md:p-8">
              {/* Score Badge */}
              <div className="mx-auto mb-6 max-w-xs rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
                <p className="text-4xl font-extrabold text-gray-900">{scorePercent}%</p>
                <p className="mt-1 text-sm font-medium text-gray-500">Score</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="/quiz"
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98] sm:w-auto md:px-8"
                >
                  Play Again (New Questions)
                </a>
                <a href="/" className="w-full rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-center text-sm font-bold text-gray-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 sm:w-auto md:px-8">
                  Back to Home
                </a>
              </div>
            </div>
          </div>

          {/* Article below result */}
          {article && (
            <div className="mt-0 overflow-hidden rounded-b-3xl border-t border-gray-100 bg-white px-6 py-8 shadow-xl md:px-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                  <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Expert Guide</h3>
              </div>
              <div
                className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900 prose-h2:text-base prose-h2:font-bold prose-h3:text-sm prose-h3:font-semibold prose-p:leading-relaxed"
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
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Banner Ad 1: Header (very top) */}
      {customBannerCode && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <div dangerouslySetInnerHTML={{ __html: customBannerCode }} />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
        {/* Quiz Header */}
        <div className="mb-6 text-center md:mb-8">
          <div className="mb-3 inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 md:text-sm">
              {categoryTitle || 'Quiz'}
            </span>
          </div>
        </div>

        {/* Go Tiles Image (video thumbnail with play button) - above progress bar */}
        <GoTilesImage />

        {/* Progress */}
        <div className="mb-6 md:mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Question {currentIndex + 1} of {totalQuestions}</span>
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
              {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out"
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
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="p-6 md:p-8">
            <h2 className="mb-6 text-xl font-extrabold leading-snug text-gray-900 md:mb-8 md:text-2xl">
              {currentQuestion?.question}
            </h2>

            <div className="space-y-3 md:space-y-4">
              {currentQuestion?.options.map((option, idx) => {
                const isSelected = selectedOption === idx
                const isCorrect = idx === currentQuestion.correctAnswer
                const showFeedback = selectedOption !== null

                let btnClass = 'border-2 border-gray-200 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md'
                if (showFeedback && isCorrect) {
                  btnClass = `${optionColors[idx % optionColors.length].correct} shadow-lg text-white`
                } else if (showFeedback && isSelected && !isCorrect) {
                  btnClass = `${optionColors[idx % optionColors.length].wrong} shadow-lg text-white`
                } else if (isSelected) {
                  btnClass = `${optionColors[idx % optionColors.length].selected} shadow-lg text-white`
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] md:p-5 ${btnClass} disabled:cursor-default`}
                  >
                    <span className={`text-sm font-bold md:text-base ${isSelected || (showFeedback && isCorrect) ? 'text-white' : ''}`}>
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
          <div className="mt-0 overflow-hidden rounded-b-3xl border-t border-gray-100 bg-white px-6 py-8 shadow-xl md:px-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Expert Guide</h3>
            </div>
            <div
              className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900 prose-h2:text-base prose-h2:font-bold prose-h3:text-sm prose-h3:font-semibold prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article }}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
