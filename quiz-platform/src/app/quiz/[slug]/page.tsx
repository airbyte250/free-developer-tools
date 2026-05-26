import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenant'
import RandomQuizEngine from '@/components/RandomQuizEngine'

import type { Metadata } from 'next'

// High-CPM keywords by category slug (targeted for maximum ad revenue)
const categoryKeywords: Record<string, string[]> = {
  'insurance-risk-management': [
    'life insurance quotes online', 'health insurance comparison tool', 'auto insurance rates calculator',
    'business liability insurance cost', 'term life insurance premium', 'whole life insurance policy',
    'workers compensation insurance', 'commercial property insurance', 'professional liability coverage',
    'disability insurance quotes', 'umbrella insurance policy', 'insurance claim settlement'
  ],
  'mortgage-home-lending': [
    'mortgage rates today', 'home loan calculator', 'refinance mortgage rates',
    'FHA loan requirements', 'VA home loan eligibility', 'jumbo mortgage rates',
    'home equity line of credit', 'reverse mortgage calculator', 'mortgage pre-approval',
    'closing costs calculator', 'PMI insurance rates', 'second mortgage rates'
  ],
  'legal-services-assessment': [
    'personal injury lawyer near me', 'mesothelioma attorney', 'car accident lawyer',
    'wrongful death attorney', 'medical malpractice lawyer', 'workers compensation attorney',
    'disability lawyer', 'employment discrimination attorney', 'class action lawsuit',
    'asbestos exposure attorney', 'truck accident lawyer', 'slip and fall attorney'
  ],
  'enterprise-crm-sales-tech': [
    'salesforce pricing plans', 'CRM software comparison', 'enterprise CRM platform',
    'sales automation software', 'HubSpot vs Salesforce', 'marketing automation tools',
    'customer relationship management', 'lead generation software', 'sales pipeline management',
    'CRM implementation cost', 'business intelligence CRM', 'cloud CRM solution'
  ],
  'financial-planning-wealth': [
    'financial advisor near me', 'wealth management services', 'retirement planning calculator',
    'investment portfolio analysis', 'estate planning attorney', 'tax planning strategies',
    'annuity rates today', '401k rollover options', 'fiduciary financial planner',
    'high net worth wealth management', 'Roth IRA conversion', 'capital gains tax calculator'
  ],
  'cybersecurity-compliance': [
    'cybersecurity assessment tool', 'SOC 2 compliance audit', 'penetration testing services',
    'data breach prevention', 'HIPAA compliance software', 'ransomware protection enterprise',
    'zero trust security architecture', 'managed security services', 'endpoint detection response',
    'cloud security posture management', 'vulnerability assessment tool', 'GDPR compliance checklist'
  ],
  'cloud-computing-devops': [
    'AWS cloud migration services', 'Azure vs AWS pricing', 'cloud infrastructure cost',
    'kubernetes managed services', 'DevOps consulting services', 'cloud security assessment',
    'serverless architecture cost', 'multi-cloud strategy', 'cloud disaster recovery',
    'containerization services', 'CI/CD pipeline tools', 'infrastructure as code'
  ],
  'digital-marketing-seo': [
    'SEO services pricing', 'PPC management agency', 'conversion rate optimization',
    'Google Ads management cost', 'enterprise SEO platform', 'marketing automation ROI',
    'content marketing strategy', 'social media advertising cost', 'email marketing platform',
    'programmatic advertising', 'digital marketing agency', 'lead generation services'
  ],
  'healthcare-technology': [
    'EHR system comparison', 'telehealth platform pricing', 'medical billing software',
    'HIPAA compliant cloud', 'healthcare analytics platform', 'patient engagement software',
    'clinical decision support', 'healthcare interoperability', 'medical practice management',
    'revenue cycle management', 'health information exchange', 'remote patient monitoring'
  ],
  'business-intelligence-erp': [
    'ERP system comparison', 'business intelligence platform', 'data analytics software',
    'SAP implementation cost', 'Oracle ERP pricing', 'Tableau vs Power BI',
    'enterprise resource planning', 'supply chain management software', 'warehouse management system',
    'financial reporting software', 'business process automation', 'data warehouse solutions'
  ],
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const config = await getTenantConfig(hostname)

  if (!config) return { title: 'Quiz' }

  const quizzes = config.category.quizData.quizzes
  const targetQuiz = quizzes.find((q: { slug: string }) => q.slug === slug)
  if (!targetQuiz) {
    return {
      title: `${config.category.metaTitle} | Free Assessment`,
      description: config.category.metaDescription,
    }
  }

  const catSlug = config.category.slug
  const keywords = categoryKeywords[catSlug] || []
  const quizTitle = targetQuiz.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())

  return {
    title: `${quizTitle} | Free Professional Assessment Tool`,
    description: `Take our free ${quizTitle} to evaluate your needs. Expert-level assessment with personalized recommendations. Compare options, calculate costs, and make informed decisions.`,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${quizTitle} | Professional Assessment`,
      description: `Free expert assessment tool. Get personalized recommendations based on your specific situation.`,
      type: 'website',
    },
    other: {
      'article:section': config.category.metaTitle,
      'topic': keywords.slice(0, 3).join(', '),
    }
  }
}

export default async function QuizSlugPage({ params }: PageProps) {
  const { slug } = await params
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || 'localhost'
  const config = await getTenantConfig(hostname)

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Domain Not Configured</h1>
          <p className="mt-2 text-gray-600">This domain has not been set up yet.</p>
        </div>
      </div>
    )
  }

  const quizzes = config.category.quizData.quizzes
  const targetQuiz = quizzes.find((q: { slug: string }) => q.slug === slug)

  // If slug not found in this category, serve random questions from category pool
  let selectedQuestions: { question: string; options: string[]; correctAnswer: number }[]
  let article: string | null

  if (targetQuiz) {
    const quizQuestions = targetQuiz.steps.map((step: { question: string; options: string[]; correctAnswer?: number }) => ({
      question: step.question,
      options: step.options,
      correctAnswer: step.correctAnswer ?? 0,
    }))
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5)
    selectedQuestions = shuffled.slice(0, 5)
    article = targetQuiz.article || null
  } else {
    // Fallback: pool all questions from all quizzes in this category
    const allQuestions: { question: string; options: string[]; correctAnswer: number }[] = []
    for (const quiz of quizzes) {
      for (const step of quiz.steps) {
        allQuestions.push({ question: step.question, options: step.options, correctAnswer: step.correctAnswer ?? 0 })
      }
    }
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
    selectedQuestions = shuffled.slice(0, 5)
    const quizzesWithArticles = quizzes.filter((q: { article: string }) => q.article)
    article = quizzesWithArticles.length > 0
      ? quizzesWithArticles[Math.floor(Math.random() * quizzesWithArticles.length)].article
      : null
  }

  // Get category keywords for structured data
  const catSlug = config.category.slug
  const keywords = categoryKeywords[catSlug] || []

  return (
    <>
      {/* Schema.org structured data for high-CPM targeting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: targetQuiz?.title || slug.replace(/-/g, ' '),
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            keywords: keywords.join(', '),
            about: {
              '@type': 'Thing',
              name: config.category.metaTitle,
            }
          })
        }}
      />
      <RandomQuizEngine
        questions={selectedQuestions}
        categoryTitle={config.category.metaTitle}
        customBannerCode={config.customBannerCode}
        headerScript={config.headerScript}
        article={article}
        quizSlug={slug}
      />
    </>
  )
}
