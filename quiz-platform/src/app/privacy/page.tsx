import { headers } from 'next/headers'
import Link from 'next/link'

export default async function PrivacyPage() {
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
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p>{capitalizedName} collects information you provide directly through our assessment platform, including quiz responses and interaction data. We also automatically collect device information, browser type, IP address, and usage analytics through cookies and similar technologies.</p>

          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p>We use collected information to provide and improve our services, personalize your experience, display relevant advertisements through Google AdSense/AdX, and analyze platform usage patterns to enhance performance.</p>

          <h2 className="text-xl font-semibold text-gray-900">3. Advertising</h2>
          <p>We use Google AdSense and Google Ad Exchange (AdX) to display advertisements. These services may use cookies and web beacons to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising by visiting Google&apos;s Ad Settings.</p>

          <h2 className="text-xl font-semibold text-gray-900">4. Cookies</h2>
          <p>We use cookies to enhance your experience, remember preferences, and serve targeted advertisements. You can control cookie preferences through your browser settings.</p>

          <h2 className="text-xl font-semibold text-gray-900">5. Data Security</h2>
          <p>We implement industry-standard security measures to protect your information, including encryption in transit and at rest. However, no method of transmission over the Internet is 100% secure.</p>

          <h2 className="text-xl font-semibold text-gray-900">6. Third-Party Services</h2>
          <p>Our platform integrates with third-party services including Google Analytics and Google AdSense/AdX. These services have their own privacy policies governing the use of your information.</p>

          <h2 className="text-xl font-semibold text-gray-900">7. Contact Us</h2>
          <p>For questions about this Privacy Policy, please visit our <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link>.</p>
        </div>
      </main>
    </div>
  )
}
