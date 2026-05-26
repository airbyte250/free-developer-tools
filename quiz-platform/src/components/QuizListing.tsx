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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Top Banner Ad */}
      <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 py-2 text-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClientId}
          data-ad-slot={bannerSlotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>

      {/* Premium Header */}
      <header className="relative overflow-hidden border-b border-gray-200/50 bg-white/80 px-4 py-8 backdrop-blur-sm md:px-6 md:py-12">
        {/* Background decoration */}
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-blue-100/50 to-indigo-100/50 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-purple-100/30 to-pink-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Professional Assessment Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">{categoryTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:mt-4 md:text-lg">{categoryDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2 md:mt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Enterprise Assessment
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Free Analysis
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              Professional Grade
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 shadow-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
              ROI Calculator
            </span>
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
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.99] md:p-6"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 transition-all duration-300 group-hover:from-blue-50/50 group-hover:to-indigo-50/50" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-110 md:h-12 md:w-12">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-gray-900 transition-colors group-hover:text-blue-700 md:text-lg">
                    {quiz.title}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500 line-clamp-2 md:text-sm">
                    {quiz.description}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition-all group-hover:bg-blue-100 group-hover:text-blue-700 md:text-sm">
                    Start Assessment
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* SEO Content Section */}
        <section className="mt-12 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl md:mt-16">
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">About Our Professional Assessment Tools</h2>
          </div>
          <div className="p-6 md:p-8">
            <div className="space-y-4 text-sm leading-relaxed text-gray-600 md:text-base">
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
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-blue-600 md:text-3xl">100+</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">Assessment Tools</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-green-600 md:text-3xl">50K+</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">Assessments Done</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-purple-600 md:text-3xl">340%</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">Avg ROI Improvement</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-orange-600 md:text-3xl">4.8/5</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">User Satisfaction</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Bottom Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/50 bg-white/95 py-1 text-center shadow-2xl backdrop-blur-md">
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
