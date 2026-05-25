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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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

      {/* Header with SEO keywords */}
      <header className="border-b bg-white px-4 py-6 shadow-sm md:px-6 md:py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900 md:text-4xl">{categoryTitle}</h1>
          <p className="mt-2 text-sm text-gray-600 md:mt-3 md:text-lg">{categoryDescription}</p>
          <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Enterprise Assessment</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Free Analysis</span>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">Professional Grade</span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">ROI Calculator</span>
          </div>
        </div>
      </header>

      {/* Quiz Grid */}
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {quizzes.map((quiz, idx) => (
            <a
              key={quiz.slug}
              href={`/quiz?q=${quiz.slug}&step=1`}
              className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-lg md:p-6"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white md:h-10 md:w-10">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 md:text-lg">
                    {quiz.title}
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2 md:text-sm">
                    {quiz.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 md:mt-3 md:text-sm">
                    <span>Start Assessment</span>
                    <svg className="h-3 w-3 transition-transform group-hover:translate-x-1 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* SEO Content Section */}
        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 md:mt-16 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">About Our Professional Assessment Tools</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700 md:mt-4 md:space-y-4 md:text-base">
            <p>
              Our enterprise-grade assessment platform provides data-driven insights for business leaders,
              financial professionals, and technology decision-makers. Each assessment evaluates your specific
              situation against industry benchmarks and best practices to deliver personalized recommendations
              with projected ROI and implementation timelines.
            </p>
            <p>
              Powered by proprietary algorithms analyzing thousands of enterprise data points, our tools help
              organizations optimize their technology investments, reduce operational costs, improve revenue
              efficiency, and make better strategic decisions. Whether you&apos;re evaluating CRM platforms,
              insurance coverage, mortgage options, or cybersecurity posture — our assessments provide the
              clarity needed for confident decision-making.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 md:text-2xl">100+</div>
                <div className="text-xs text-gray-500">Assessment Tools</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 md:text-2xl">50K+</div>
                <div className="text-xs text-gray-500">Assessments Completed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 md:text-2xl">340%</div>
                <div className="text-xs text-gray-500">Average ROI Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 md:text-2xl">4.8/5</div>
                <div className="text-xs text-gray-500">User Satisfaction</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Bottom Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-100 py-1 text-center">
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
