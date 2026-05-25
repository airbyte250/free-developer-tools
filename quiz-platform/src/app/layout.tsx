import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const config = await getTenantConfig(hostname)

  if (!config) {
    return {
      title: 'Quiz Platform',
      description: 'Enterprise Quiz Assessment Platform',
    }
  }

  return {
    title: config.category.metaTitle,
    description: config.category.metaDescription,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
