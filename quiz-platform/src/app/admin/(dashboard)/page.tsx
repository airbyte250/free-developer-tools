import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [tenantCount, categoryCount, activeTenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.category.count(),
    prisma.tenant.count({ where: { status: 'active' } }),
  ])

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Total Tenants</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{tenantCount}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Active Tenants</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{activeTenants}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm font-medium text-gray-500">Quiz Categories</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{categoryCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/admin/tenants"
          className="flex items-center gap-4 rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Manage Tenants</h3>
            <p className="text-sm text-gray-500">Add, edit, or remove domain configurations</p>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="flex items-center gap-4 rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Manage Categories</h3>
            <p className="text-sm text-gray-500">Edit quiz content and niche configurations</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
