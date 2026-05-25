import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/quiz_platform'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const categories = [
  {
    slug: 'b2b-saas-crm',
    metaTitle: 'Premium CRM Lead Management Automation Assessment',
    metaDescription: 'Evaluate your enterprise CRM infrastructure, lead qualification processes, and customer retention automation. Get actionable ROI optimization insights.',
    quizData: {
      title: 'Enterprise CRM Assessment',
      steps: [
        { step: 1, question: 'What is your current CRM platform?', options: ['Salesforce Enterprise', 'HubSpot Professional', 'Microsoft Dynamics 365', 'Zoho CRM Plus', 'Custom/In-house Solution'] },
        { step: 2, question: 'How many qualified leads does your team process monthly?', options: ['Under 100', '100-500', '500-2,000', '2,000-10,000', '10,000+ Enterprise Scale'] },
        { step: 3, question: 'What is your biggest pipeline automation bottleneck?', options: ['Lead Scoring & Qualification', 'Follow-up Sequence Automation', 'Multi-channel Data Integration', 'Revenue Attribution & Analytics', 'Cross-team Collaboration Workflows'] },
        { step: 4, question: 'What is your annual marketing technology budget?', options: ['Under $10K', '$10K-$50K', '$50K-$200K', '$200K-$1M', '$1M+ Enterprise'] },
        { step: 5, question: 'What ROI improvement would justify a new platform investment?', options: ['10-20% Efficiency Gain', '20-40% Pipeline Velocity', '40-60% Lead Conversion Rate', '60-100% Revenue Growth', '100%+ Transformation Scale'] },
      ],
      resultLogic: { type: 'score', message: 'Based on your enterprise profile, you qualify for our Premium CRM Automation tier with 47% higher ROI potential. Your pipeline efficiency score ranks in the top 12% of assessed enterprises.' },
    },
  },
  {
    slug: 'real-estate-crm',
    metaTitle: 'Real Estate Lead Management & CRM Architecture Audit',
    metaDescription: 'Comprehensive assessment of real estate technology stack, lead routing automation, and property management CRM optimization for maximum conversion.',
    quizData: {
      title: 'Real Estate CRM Audit',
      steps: [
        { step: 1, question: 'What type of real estate operations do you manage?', options: ['Residential Brokerage', 'Commercial Real Estate', 'Property Management', 'Real Estate Investment (REITs)', 'Multi-family Development'] },
        { step: 2, question: 'How many active property listings do you manage?', options: ['1-10 Properties', '10-50 Properties', '50-200 Properties', '200-1,000 Properties', '1,000+ Portfolio Scale'] },
        { step: 3, question: 'What is your primary lead source?', options: ['Zillow/Realtor.com', 'Google/Meta Ads', 'Referral Network', 'Open Houses/Events', 'Mixed Multi-channel'] },
        { step: 4, question: 'What CRM feature matters most for your team?', options: ['Automated Lead Routing', 'Transaction Management', 'Client Communication Sequences', 'Market Analytics Dashboard', 'IDX/MLS Integration'] },
        { step: 5, question: 'What is your average deal cycle time?', options: ['Under 30 Days', '30-60 Days', '60-90 Days', '90-180 Days', '180+ Days (Commercial)'] },
      ],
      resultLogic: { type: 'score', message: 'Your real estate operation shows 62% optimization potential. Our analysis indicates a Premium Lead Routing system could reduce your deal cycle by 34% and increase conversion rates by 28%.' },
    },
  },
  {
    slug: 'financial-lead-audit',
    metaTitle: 'Financial Services Lead Leakage & Compliance Audit Tool',
    metaDescription: 'Enterprise-grade assessment for financial advisors, loan officers, and insurance professionals. Identify lead leakage, optimize customer acquisition cost, and ensure regulatory compliance.',
    quizData: {
      title: 'Financial Lead Audit',
      steps: [
        { step: 1, question: 'What financial services segment are you in?', options: ['Mortgage/Lending', 'Insurance (Life/Health)', 'Wealth Management', 'Banking/Fintech', 'Accounting/Tax Advisory'] },
        { step: 2, question: 'What is your current cost per qualified lead?', options: ['Under $25', '$25-$75', '$75-$200', '$200-$500', '$500+ (High-value Financial)'] },
        { step: 3, question: 'How do you currently track lead-to-close attribution?', options: ['Manual Spreadsheets', 'Basic CRM Reporting', 'Marketing Automation Platform', 'Custom BI Dashboard', 'No Clear Attribution Model'] },
        { step: 4, question: 'What compliance framework applies to your operations?', options: ['GDPR/CCPA', 'SOC 2', 'PCI-DSS', 'SEC/FINRA Regulations', 'Multiple Frameworks'] },
        { step: 5, question: 'What percentage of leads do you estimate are lost to poor follow-up?', options: ['Under 10%', '10-25%', '25-40%', '40-60%', '60%+ Critical Leakage'] },
      ],
      resultLogic: { type: 'score', message: 'CRITICAL: Your financial lead infrastructure shows 43% estimated leakage. Our Compliance-Grade Lead Management system can recover an estimated $127K in annual lost revenue while maintaining full regulatory compliance.' },
    },
  },
  {
    slug: 'hubspot-vs-salesforce',
    metaTitle: 'HubSpot vs Salesforce Enterprise Comparison Assessment',
    metaDescription: 'Data-driven platform comparison tool for enterprise decision-makers. Evaluate CRM features, pricing, scalability, and integration capabilities for your specific use case.',
    quizData: {
      title: 'CRM Platform Comparison',
      steps: [
        { step: 1, question: 'What is your primary use case for a CRM platform?', options: ['Sales Pipeline Management', 'Marketing Automation', 'Customer Service/Support', 'Full Revenue Operations', 'Specific Department Only'] },
        { step: 2, question: 'How many users will need CRM access?', options: ['1-5 Users', '5-25 Users', '25-100 Users', '100-500 Users', '500+ Enterprise'] },
        { step: 3, question: 'What is your integration complexity level?', options: ['Simple (Email + Calendar)', 'Moderate (5-10 Tools)', 'Complex (10-25 Integrations)', 'Enterprise (25+ Systems)', 'Custom API Requirements'] },
        { step: 4, question: 'What is your acceptable monthly per-user budget?', options: ['Under $25/user', '$25-$75/user', '$75-$150/user', '$150-$300/user', '$300+/user Enterprise'] },
        { step: 5, question: 'Which factor is most critical for your decision?', options: ['Ease of Use', 'Customization Depth', 'Reporting & Analytics', 'Scalability', 'Total Cost of Ownership'] },
      ],
      resultLogic: { type: 'comparison', message: 'Based on your enterprise profile: Salesforce scores 8.4/10 for your use case. HubSpot scores 7.9/10. Key differentiator: Your integration complexity and user scale favor Salesforce Enterprise, but HubSpot offers 23% lower TCO for your team size.' },
    },
  },
]

async function main() {
  console.log('Seeding database...')

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { metaTitle: cat.metaTitle, metaDescription: cat.metaDescription, quizData: cat.quizData },
      create: cat,
    })
    console.log(`  Created/updated category: ${cat.slug}`)
  }

  // Create example tenants
  const b2bCategory = await prisma.category.findUnique({ where: { slug: 'b2b-saas-crm' } })
  const realEstateCategory = await prisma.category.findUnique({ where: { slug: 'real-estate-crm' } })

  if (b2bCategory) {
    await prisma.tenant.upsert({
      where: { hostname: 'crm-assessment.example.com' },
      update: {},
      create: {
        hostname: 'crm-assessment.example.com',
        categoryId: b2bCategory.id,
        adClientId: 'ca-pub-1234567890123456',
        bannerSlotId: '1111111111',
        interstitialSlotId: '2222222222',
        anchorSlotId: '3333333333',
        analyticsId: 'G-EXAMPLE001',
        adsTxt: {
          create: [
            { line: 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0' },
          ],
        },
      },
    })
    console.log('  Created example tenant: crm-assessment.example.com')
  }

  if (realEstateCategory) {
    await prisma.tenant.upsert({
      where: { hostname: 'realestate-quiz.example.com' },
      update: {},
      create: {
        hostname: 'realestate-quiz.example.com',
        categoryId: realEstateCategory.id,
        adClientId: 'ca-pub-9876543210987654',
        bannerSlotId: '4444444444',
        interstitialSlotId: '5555555555',
        anchorSlotId: '6666666666',
        analyticsId: 'G-EXAMPLE002',
        adsTxt: {
          create: [
            { line: 'google.com, pub-9876543210987654, DIRECT, f08c47fec0942fa0' },
          ],
        },
      },
    })
    console.log('  Created example tenant: realestate-quiz.example.com')
  }

  console.log('Seed completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
