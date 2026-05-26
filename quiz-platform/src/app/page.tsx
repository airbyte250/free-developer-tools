import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import Link from 'next/link'
import Footer from '@/components/Footer'

const MAIN_DOMAINS = ['coolganwar.com', 'www.coolganwar.com']

export default async function HomePage() {
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const config = await getTenantConfig(hostname)

  if (MAIN_DOMAINS.includes(hostname) || (!config && hostname === 'localhost')) {
    return <LandingPage />
  }

  return <TenantHomePage hostname={hostname} config={config} />
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="text-xl font-bold text-white">CoolGanwar</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-300 transition hover:text-white">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-300 transition hover:text-white">How It Works</a>
            <a href="#pricing" className="text-sm text-gray-300 transition hover:text-white">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://app.coolganwar.com" className="text-sm font-medium text-gray-300 transition hover:text-white">Login</a>
            <a href="https://app.coolganwar.com" className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24 lg:pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Trusted by 500+ Publishers
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Multi-Tenant Quiz
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Monetization</span> Platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 leading-relaxed">
            Launch high-CPM quiz funnels across unlimited domains. One dashboard, isolated ad ecosystems, premium AdSense/AdX monetization — go live in under 60 seconds.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="https://app.coolganwar.com" className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-center text-lg font-semibold text-white shadow-2xl shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/40 sm:w-auto">
              Start Free Trial
            </a>
            <a href="#how-it-works" className="w-full rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-center text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto">
              See How It Works
            </a>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              No Credit Card Required
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              1-Minute Setup
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Unlimited Domains
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10 bg-slate-900/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything You Need to Scale</h2>
            <p className="mt-4 text-lg text-gray-400">Built for performance, optimized for revenue</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Multi-Tenant Engine', desc: 'Serve unlimited domains from one codebase. Host-based routing with isolated configs.', icon: '🌐' },
              { title: 'Isolated Ad Ecosystem', desc: 'Unique publisher IDs and ad slots per domain. Zero ad code sharing between tenants.', icon: '🎯' },
              { title: 'High-CPM Quiz Funnels', desc: '5-step quiz with URL-state routing triggers fresh ad auctions per step for maximum impressions.', icon: '💰' },
              { title: 'Interstitial Monetization', desc: 'Step 4 artificial delay with animated loader achieves 100% viewability on high-paying interstitials.', icon: '📈' },
              { title: 'Dynamic ads.txt', desc: 'Auto-generated per-domain ads.txt ensures Google policy compliance across all tenants.', icon: '✅' },
              { title: '1-Minute Provisioning', desc: 'Add domain, select niche, paste ad codes — live in under 60 seconds via admin dashboard.', icon: '⚡' },
            ].map((feature, i) => (
              <div key={i} className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-indigo-500/50 hover:bg-white/10">
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Go Live in 3 Steps</h2>
            <p className="mt-4 text-lg text-gray-400">From zero to earning in under a minute</p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              { step: '01', title: 'Add Your Domain', desc: 'Point your domain DNS and register it in the dashboard. We handle the rest.' },
              { step: '02', title: 'Configure Ad Codes', desc: 'Paste your AdSense publisher ID and slot IDs. Choose your quiz niche from our library.' },
              { step: '03', title: 'Start Earning', desc: 'Your quiz goes live instantly. Drive Meta Ads traffic and watch CPMs soar.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: '500+', label: 'Active Publishers' },
            { value: '$45+', label: 'Average CPM' },
            { value: '10M+', label: 'Monthly Impressions' },
            { value: '<1s', label: 'Page Load Time' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-extrabold text-white">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Maximize Your Ad Revenue?</h2>
          <p className="mt-4 text-lg text-gray-400">Join hundreds of publishers already earning premium CPMs with our quiz platform.</p>
          <a href="https://app.coolganwar.com" className="mt-8 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-10 py-4 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-purple-700">
            Get Started Now — It&apos;s Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="text-lg font-bold text-white">CoolGanwar</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 transition hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-400 transition hover:text-white">Terms of Service</Link>
            <Link href="/contact" className="text-sm text-gray-400 transition hover:text-white">Contact</Link>
          </div>
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} CoolGanwar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function TenantHomePage({ hostname, config }: { hostname: string; config: Awaited<ReturnType<typeof getTenantConfig>> }) {
  const displayName = hostname.replace(/^www\./, '').split('.')[0]
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
  const categorySlug = config?.category.slug || ''
  const totalQuizzes = config?.category.quizData.quizzes.length || 0

  // Category-specific colors and icons
  const categoryThemes: Record<string, { gradient: string; icon: string; badge: string }> = {
    'insurance': { gradient: 'from-blue-600 to-cyan-500', icon: '🛡️', badge: 'bg-blue-100 text-blue-800' },
    'mortgage': { gradient: 'from-emerald-600 to-teal-500', icon: '🏠', badge: 'bg-emerald-100 text-emerald-800' },
    'legal': { gradient: 'from-purple-600 to-indigo-500', icon: '⚖️', badge: 'bg-purple-100 text-purple-800' },
    'crm': { gradient: 'from-orange-500 to-amber-500', icon: '📊', badge: 'bg-orange-100 text-orange-800' },
    'financial': { gradient: 'from-green-600 to-emerald-500', icon: '💰', badge: 'bg-green-100 text-green-800' },
    'cyber': { gradient: 'from-red-600 to-pink-500', icon: '🔒', badge: 'bg-red-100 text-red-800' },
    'cloud': { gradient: 'from-sky-600 to-blue-500', icon: '☁️', badge: 'bg-sky-100 text-sky-800' },
    'marketing': { gradient: 'from-pink-600 to-rose-500', icon: '📈', badge: 'bg-pink-100 text-pink-800' },
    'health': { gradient: 'from-teal-600 to-cyan-500', icon: '🏥', badge: 'bg-teal-100 text-teal-800' },
    'business': { gradient: 'from-indigo-600 to-violet-500', icon: '📉', badge: 'bg-indigo-100 text-indigo-800' },
  }

  const themeKey = Object.keys(categoryThemes).find(k => categorySlug.includes(k)) || 'crm'
  const theme = categoryThemes[themeKey]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner Ad */}
      {config?.customBannerCode && (
        <div className="mx-auto max-w-4xl px-4 pt-3">
          <div dangerouslySetInnerHTML={{ __html: config.customBannerCode }} />
        </div>
      )}

      {/* Header with Logo */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-xl shadow-lg`}>
              {theme.icon}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{capitalizedName}</h1>
              <p className="text-xs text-gray-500">Professional Assessment Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${theme.badge}`}>
              {totalQuizzes}+ Questions
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="absolute inset-0 -z-10">
          <div className={`absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-br ${theme.gradient} opacity-5 blur-3xl`} />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full ${theme.badge} px-4 py-2 text-sm font-semibold`}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
            Free Professional Assessment
          </div>
          <h2 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
            {config?.category.metaTitle || 'Professional Assessment Tool'}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            {config?.category.metaDescription || 'Take our comprehensive assessment to evaluate your expertise and get personalized recommendations.'}
          </p>

          {/* CTA Button */}
          <div className="mt-10">
            <Link
              href="/quiz"
              className={`inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${theme.gradient} px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-3xl active:scale-[0.98]`}
            >
              Start Quiz Now
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-4 text-sm text-gray-500">5 random questions • Real-time scoring • Takes 60 seconds</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-md`}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">Random Questions</h3>
            <p className="mt-2 text-sm text-gray-600">5 questions randomly selected from our pool of {totalQuizzes}+ — every attempt is unique</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-md`}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">Real Scoring</h3>
            <p className="mt-2 text-sm text-gray-600">Get your actual score based on correct answers — no fake results</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-md`}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">60 Seconds</h3>
            <p className="mt-2 text-sm text-gray-600">Quick assessment — test your knowledge in under a minute</p>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h3 className="mb-4 text-xl font-bold text-gray-900">About This Assessment</h3>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>Our {config?.category.metaTitle || 'professional assessment'} uses scientifically validated question pools covering key industry domains. Each session presents 5 randomly selected questions from our database of {totalQuizzes}+ expert-curated items.</p>
            <p className="mt-3">Whether you&#39;re a seasoned professional or exploring a new field, this assessment provides instant feedback on your knowledge level with personalized improvement recommendations.</p>
          </div>
        </div>
      </section>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: config?.category.metaTitle || capitalizedName,
            description: config?.category.metaDescription || 'Professional Assessment Platform',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
    </div>
  )
}
