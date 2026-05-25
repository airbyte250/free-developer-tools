import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import Link from 'next/link'

export default async function HomePage() {
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const config = await getTenantConfig(hostname)

  const displayName = hostname.replace(/^www\./, '').split('.')[0]
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">{capitalizedName}</h1>
          <p className="mt-1 text-sm text-gray-500">Enterprise Assessment Platform</p>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            {config?.category.metaTitle || 'Discover Your Enterprise Potential'}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            {config?.category.metaDescription || 'Take our comprehensive assessment to evaluate your business infrastructure, optimize ROI, and unlock growth opportunities.'}
          </p>
          <div className="mt-10">
            <Link
              href="/quiz?step=1"
              className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              Start Free Assessment
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Enterprise Grade</h3>
            <p className="mt-2 text-sm text-gray-600">Built for scale with industry-leading security standards</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Instant Results</h3>
            <p className="mt-2 text-sm text-gray-600">Get actionable insights in under 60 seconds</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Data Secure</h3>
            <p className="mt-2 text-sm text-gray-600">Your responses are encrypted and never shared</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} {capitalizedName}. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: config?.category.metaTitle || capitalizedName,
            description: config?.category.metaDescription || 'Enterprise Assessment Platform',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
    </div>
  )
}
