'use client'

import Footer from '@/components/Footer'

interface QuizListingProps {
  quizzes: { slug: string; title: string; description: string }[]
  categoryTitle: string
  categoryDescription: string
  adClientId: string
  bannerSlotId: string
  anchorSlotId: string
}

export default function QuizListing({ quizzes, categoryTitle, categoryDescription, adClientId, bannerSlotId, anchorSlotId }: QuizListingProps) {
  const cardColors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-rose-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-yellow-600',
    'from-teal-500 to-emerald-600',
    'from-pink-500 to-rose-600',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner Ad */}
      <div className="w-full bg-gray-100 py-2 text-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClientId}
          data-ad-slot={bannerSlotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>

      {/* Header */}
      <header className="bg-white px-4 py-8 shadow-sm md:px-6 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Professional Assessment Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">{categoryTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:mt-4 md:text-lg">{categoryDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2 md:mt-5">
            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">Enterprise Assessment</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">Free Analysis</span>
            <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700">Professional Grade</span>
            <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700">ROI Calculator</span>
          </div>
        </div>
      </header>

      {/* Quiz Grid */}
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {quizzes.map((quiz, idx) => (
            <a
              key={quiz.slug}
              href={`/quiz/${quiz.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]"
            >
              {/* Colored top bar */}
              <div className={`h-1.5 bg-gradient-to-r ${cardColors[idx % cardColors.length]}`} />
              <div className="p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cardColors[idx % cardColors.length]} text-sm font-bold text-white shadow-lg`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 md:text-lg">
                      {quiz.title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500 line-clamp-2 md:text-sm">
                      {quiz.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-indigo-600 md:text-sm">
                      Start Quiz
                      <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Stats Section */}
        <section className="mt-12 overflow-hidden rounded-3xl bg-white shadow-xl md:mt-16">
          <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">About Our Assessment Tools</h2>
          </div>
          <div className="p-6 md:p-8">
            <div className="space-y-4 text-sm leading-relaxed text-gray-600 md:text-base">
              <p>
                Our enterprise-grade assessment platform provides data-driven insights for business leaders,
                financial professionals, and technology decision-makers. Each assessment evaluates your specific
                situation against industry benchmarks and best practices.
              </p>
              <p>
                Powered by proprietary algorithms analyzing thousands of enterprise data points, our tools help
                organizations optimize investments, reduce costs, and make better strategic decisions.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-blue-600 md:text-3xl">100+</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">Assessment Tools</div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-emerald-600 md:text-3xl">50K+</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">Assessments Done</div>
              </div>
              <div className="rounded-xl bg-purple-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-purple-600 md:text-3xl">340%</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">Avg ROI Boost</div>
              </div>
              <div className="rounded-xl bg-orange-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-orange-600 md:text-3xl">4.8/5</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">User Rating</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 py-1 text-center shadow-2xl backdrop-blur-sm">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClientId}
          data-ad-slot={anchorSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
