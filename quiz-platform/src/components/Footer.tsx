import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white pb-20">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/" className="text-sm text-gray-600 hover:text-blue-600">Home</Link></li>
              <li><Link href="/quiz" className="text-sm text-gray-600 hover:text-blue-600">Assessments</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-gray-600 hover:text-blue-600">Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/quiz" className="text-sm text-gray-600 hover:text-blue-600">Free Tools</Link></li>
              <li><Link href="/quiz" className="text-sm text-gray-600 hover:text-blue-600">Calculators</Link></li>
              <li><Link href="/quiz" className="text-sm text-gray-600 hover:text-blue-600">Guides</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Connect</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600">Support</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600">Feedback</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600">Partnerships</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} All rights reserved. Professional assessment tools for enterprise decision-makers.
          </p>
        </div>
      </div>
    </footer>
  )
}
