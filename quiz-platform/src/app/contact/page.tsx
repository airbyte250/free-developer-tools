import { headers } from 'next/headers'
import Link from 'next/link'

export default async function ContactPage() {
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const displayName = hostname.replace(/^www\./, '').split('.')[0]
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1)

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link href="/" className="text-xl font-bold text-gray-900">{capitalizedName}</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Contact Us</h1>
        <div className="rounded-xl bg-gray-50 p-8">
          <p className="mb-6 text-gray-700">
            Have questions about {capitalizedName}? We&apos;d love to hear from you. Reach out through any of the methods below.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700">support@{hostname}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="text-gray-700">https://{hostname}</span>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Send us a message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="name" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
