import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { allCategories } from './data/seed-data'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/quiz_platform'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database with 10 categories and 100+ quizzes...')
  console.log(`Total categories: ${allCategories.length}`)

  let totalQuizzes = 0

  for (const cat of allCategories) {
    const quizCount = cat.quizData.quizzes.length
    totalQuizzes += quizCount

    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { metaTitle: cat.metaTitle, metaDescription: cat.metaDescription, quizData: JSON.parse(JSON.stringify(cat.quizData)) },
      create: {
        slug: cat.slug,
        metaTitle: cat.metaTitle,
        metaDescription: cat.metaDescription,
        quizData: JSON.parse(JSON.stringify(cat.quizData)),
      },
    })
    console.log(`  Created/updated category: ${cat.slug} (${quizCount} quizzes)`)
  }

  console.log(`\nTotal quizzes seeded: ${totalQuizzes}`)

  // Create CoolGanwar tenant with insurance category (highest CPM)
  const insuranceCategory = await prisma.category.findUnique({ where: { slug: 'insurance-risk-management' } })

  if (insuranceCategory) {
    await prisma.tenant.upsert({
      where: { hostname: 'coolganwar.com' },
      update: { categoryId: insuranceCategory.id },
      create: {
        hostname: 'coolganwar.com',
        categoryId: insuranceCategory.id,
        adClientId: 'ca-pub-0000000000000000',
        bannerSlotId: '1000000001',
        interstitialSlotId: '1000000002',
        anchorSlotId: '1000000003',
        analyticsId: 'G-COOLGANWAR01',
        adsTxt: {
          create: [
            { line: 'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0' },
          ],
        },
      },
    })
    console.log('  Created/updated tenant: coolganwar.com (insurance-risk-management)')
  }

  // Create example tenants for other high-CPM categories
  const mortgageCategory = await prisma.category.findUnique({ where: { slug: 'mortgage-home-lending' } })
  const legalCategory = await prisma.category.findUnique({ where: { slug: 'legal-services-assessment' } })

  if (mortgageCategory) {
    await prisma.tenant.upsert({
      where: { hostname: 'crm-assessment.example.com' },
      update: { categoryId: mortgageCategory.id },
      create: {
        hostname: 'crm-assessment.example.com',
        categoryId: mortgageCategory.id,
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
    console.log('  Created/updated tenant: crm-assessment.example.com (mortgage)')
  }

  if (legalCategory) {
    await prisma.tenant.upsert({
      where: { hostname: 'realestate-quiz.example.com' },
      update: { categoryId: legalCategory.id },
      create: {
        hostname: 'realestate-quiz.example.com',
        categoryId: legalCategory.id,
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
    console.log('  Created/updated tenant: realestate-quiz.example.com (legal)')
  }

  console.log('\nSeed completed successfully!')
  console.log(`Summary: ${allCategories.length} categories, ${totalQuizzes} quizzes, 3 tenants`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
