import TenantManager from '@/components/admin/TenantManager'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function TenantsPage() {
  const [tenants, categories] = await Promise.all([
    prisma.tenant.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { slug: 'asc' } }),
  ])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tenant Management</h1>
      <TenantManager
        initialTenants={JSON.parse(JSON.stringify(tenants))}
        categories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  )
}
