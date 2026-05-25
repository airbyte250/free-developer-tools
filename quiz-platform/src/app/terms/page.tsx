import { headers } from 'next/headers'
import Link from 'next/link'

export default async function TermsPage() {
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
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Terms of Service</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p><strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p>By accessing and using {capitalizedName}, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>

          <h2 className="text-xl font-semibold text-gray-900">2. Description of Service</h2>
          <p>{capitalizedName} provides enterprise assessment and quiz tools designed to help businesses evaluate their operational infrastructure, CRM systems, lead management processes, and automation capabilities.</p>

          <h2 className="text-xl font-semibold text-gray-900">3. Use of Service</h2>
          <p>You agree to use the service only for lawful purposes and in accordance with these Terms. You shall not use the service in any way that could damage, disable, or impair the platform.</p>

          <h2 className="text-xl font-semibold text-gray-900">4. Intellectual Property</h2>
          <p>All content, features, and functionality on this platform are owned by {capitalizedName} and are protected by copyright, trademark, and other intellectual property laws.</p>

          <h2 className="text-xl font-semibold text-gray-900">5. Disclaimer</h2>
          <p>The assessment results provided are for informational purposes only. {capitalizedName} makes no guarantees regarding the accuracy, reliability, or completeness of any assessment output.</p>

          <h2 className="text-xl font-semibold text-gray-900">6. Limitation of Liability</h2>
          <p>{capitalizedName} shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use of our services.</p>

          <h2 className="text-xl font-semibold text-gray-900">7. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance of the revised Terms.</p>

          <h2 className="text-xl font-semibold text-gray-900">8. Contact</h2>
          <p>For questions regarding these Terms, please visit our <Link href="/contact" className="text-blue-600 hover:underline">Contact page</Link>.</p>
        </div>
      </main>
    </div>
  )
}
