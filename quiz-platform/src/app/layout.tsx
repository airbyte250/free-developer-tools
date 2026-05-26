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
      title: 'Enterprise Assessment Platform | Professional Business Intelligence Tools',
      description: 'Premium enterprise assessment platform for business leaders. Evaluate CRM systems, insurance coverage, mortgage rates, legal services, financial planning, cybersecurity posture, cloud infrastructure, and digital marketing ROI.',
      keywords: ['enterprise assessment', 'CRM comparison', 'business intelligence', 'ROI calculator', 'lead management', 'marketing automation', 'sales optimization', 'insurance quotes', 'mortgage calculator', 'financial planning'],
    }
  }

  return {
    title: config.category.metaTitle,
    description: config.category.metaDescription,
    keywords: [
      'enterprise software', 'CRM platform', 'lead management automation', 'ROI optimization',
      'business intelligence', 'sales automation', 'marketing technology', 'customer retention',
      'insurance comparison', 'mortgage rates', 'financial planning', 'wealth management',
      'cybersecurity assessment', 'cloud migration', 'digital transformation', 'data analytics',
    ],
    openGraph: {
      title: config.category.metaTitle,
      description: config.category.metaDescription,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const config = await getTenantConfig(hostname)

  // Schema.org structured data for maximum high-CPM ad targeting
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config?.category.metaTitle || 'Enterprise Assessment Platform',
    description: config?.category.metaDescription || 'Professional business assessment tools',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Enterprise Software',
    },
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Enterprise Decision Makers, C-Suite Executives, Business Owners, Financial Professionals',
    },
    about: [
      { '@type': 'Thing', name: 'Customer Relationship Management' },
      { '@type': 'Thing', name: 'Enterprise Resource Planning' },
      { '@type': 'Thing', name: 'Business Intelligence Analytics' },
      { '@type': 'Thing', name: 'Insurance Coverage Assessment' },
      { '@type': 'Thing', name: 'Mortgage Rate Comparison' },
      { '@type': 'Thing', name: 'Financial Planning Tools' },
      { '@type': 'Thing', name: 'Cybersecurity Risk Assessment' },
      { '@type': 'Thing', name: 'Cloud Infrastructure Planning' },
      { '@type': 'Thing', name: 'Digital Marketing ROI' },
      { '@type': 'Thing', name: 'Sales Pipeline Optimization' },
    ],
  }

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the enterprise CRM assessment work?',
        acceptedAnswer: { '@type': 'Answer', text: 'Our AI-powered assessment evaluates your current CRM infrastructure, lead management processes, and automation capabilities against 10,000+ enterprise benchmarks to provide personalized optimization recommendations with projected ROI.' },
      },
      {
        '@type': 'Question',
        name: 'What industries do the assessment tools cover?',
        acceptedAnswer: { '@type': 'Answer', text: 'Our platform covers 10 high-value categories: Insurance & Risk Management, Mortgage & Home Lending, Legal Services, Enterprise CRM & Sales, Financial Planning & Wealth Management, Cybersecurity & Compliance, Cloud Computing & DevOps, Digital Marketing & SEO, Healthcare Technology, and Business Intelligence & ERP.' },
      },
      {
        '@type': 'Question',
        name: 'Are the assessments free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, all 100+ professional assessment tools are completely free. Get enterprise-grade analysis, personalized recommendations, and projected ROI calculations at no cost.' },
      },
    ],
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="category" content="Enterprise Software, Business Intelligence, Financial Services, Insurance, Legal Technology" />
        <meta name="classification" content="Business" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="Enterprise Decision Makers, C-Suite, Business Owners, Financial Professionals" />
        <link rel="canonical" href={`https://${hostname}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
        />
        {config?.headerScript && (
          <script
            id="tenant-header-script"
            dangerouslySetInnerHTML={{ __html: `(function(){var c=document.createElement('div');c.innerHTML=${JSON.stringify(config.headerScript)};var h=document.head;while(c.firstChild){h.appendChild(c.firstChild);}})();` }}
          />
        )}
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
