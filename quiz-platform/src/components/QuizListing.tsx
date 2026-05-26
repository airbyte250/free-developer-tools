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
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Top Banner Ad */}
      <div className="w-full bg-black/30 py-2 text-center">
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
      <header className="relative overflow-hidden border-b border-white/5 px-4 py-8 md:px-6 md:py-12">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-1.5 border border-cyan-500/20">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Professional Assessment Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">{categoryTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 md:mt-4 md:text-lg">{categoryDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2 md:mt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
              Enterprise Assessment
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              Free Analysis
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300">
              Professional Grade
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
              ROI Calculator
            </span>
          </div>
        </div>
      </header>

      {/* Quiz Grid */}
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {quizzes.map((quiz, idx) => {
            const colors = [
              'from-cyan-500 to-blue-600',
              'from-purple-500 to-indigo-600',
              'from-emerald-500 to-teal-600',
              'from-amber-500 to-orange-600',
              'from-rose-500 to-pink-600',
              'from-blue-500 to-violet-600',
              'from-teal-500 to-cyan-600',
              'from-orange-500 to-red-600',
              'from-indigo-500 to-purple-600',
              'from-green-500 to-emerald-600',
            ]
            const colorClass = colors[idx % colors.length]

            return (
              <a
                key={quiz.slug}
                href={`/quiz/${quiz.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 active:scale-[0.99] md:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass} text-sm font-bold text-white shadow-lg transition-transform group-hover:scale-110 md:h-12 md:w-12`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-white transition-colors group-hover:text-cyan-300 md:text-lg">
                      {quiz.title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-400 line-clamp-2 md:text-sm">
                      {quiz.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 transition-all group-hover:text-cyan-300 md:text-sm">
                      Start Quiz
                      <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* Stats Section */}
        <section className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md md:mt-16">
          <div className="border-b border-white/10 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-xl font-extrabold text-white md:text-2xl">About Our Assessment Tools</h2>
          </div>
          <div className="p-6 md:p-8">
            <div className="space-y-4 text-sm leading-relaxed text-gray-400 md:text-base">
              <p>
                Our enterprise-grade assessment platform provides data-driven insights for business leaders,
                financial professionals, and technology decision-makers. Each assessment evaluates your specific
                situation against industry benchmarks and best practices to deliver personalized recommendations
                with projected ROI and implementation timelines.
              </p>
              <p>
                Powered by proprietary algorithms analyzing thousands of enterprise data points, our tools help
                organizations optimize their technology investments, reduce operational costs, improve revenue
                efficiency, and make better strategic decisions.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                <div className="text-2xl font-extrabold text-cyan-400 md:text-3xl">100+</div>
                <div className="mt-0.5 text-xs font-medium text-gray-400">Assessment Tools</div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                <div className="text-2xl font-extrabold text-emerald-400 md:text-3xl">50K+</div>
                <div className="mt-0.5 text-xs font-medium text-gray-400">Assessments Done</div>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-center">
                <div className="text-2xl font-extrabold text-purple-400 md:text-3xl">340%</div>
                <div className="mt-0.5 text-xs font-medium text-gray-400">Avg ROI Boost</div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                <div className="text-2xl font-extrabold text-amber-400 md:text-3xl">4.8/5</div>
                <div className="mt-0.5 text-xs font-medium text-gray-400">User Rating</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1a1a2e]/95 py-1 text-center backdrop-blur-md">
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
