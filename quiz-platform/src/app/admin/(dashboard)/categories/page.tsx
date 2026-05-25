import CategoryManager from '@/components/admin/CategoryManager'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { tenants: true } } },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Category & Quiz Management</h1>
      <CategoryManager initialCategories={JSON.parse(JSON.stringify(categories))} />
    </div>
  )
}
