import Link from 'next/link'
import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/admin/LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between md:h-16">
            <div className="flex items-center gap-4 md:gap-8">
              <Link href="/admin" className="text-lg font-bold text-gray-900 md:text-xl">
                Admin
              </Link>
              <div className="flex gap-1 overflow-x-auto md:gap-4">
                <Link
                  href="/admin/tenants"
                  className="whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 md:px-3 md:py-2 md:text-sm"
                >
                  Tenants
                </Link>
                <Link
                  href="/admin/categories"
                  className="whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 md:px-3 md:py-2 md:text-sm"
                >
                  Categories
                </Link>
                <Link
                  href="/admin/quizzes"
                  className="whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 md:px-3 md:py-2 md:text-sm"
                >
                  Quizzes
                </Link>
                <Link
                  href="/admin/users"
                  className="whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 md:px-3 md:py-2 md:text-sm"
                >
                  Users
                </Link>
                <Link
                  href="/admin/go-system"
                  className="whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 md:px-3 md:py-2 md:text-sm"
                >
                  Go System
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden text-sm text-gray-500 md:inline">
                {session.username}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        {children}
      </main>
    </div>
  )
}
