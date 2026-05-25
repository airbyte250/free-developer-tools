'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  status: string
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchUsers()
  }, [filter])

  async function fetchUsers() {
    setLoading(true)
    const url = filter ? `/api/admin/users?status=${filter}` : '/api/admin/users'
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      fetchUsers()
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchUsers()
    }
  }

  const pendingCount = users.filter((u) => u.status === 'pending').length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Approve, reject, or manage user accounts
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {['', 'pending', 'active', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(user.id, 'active')}
                            className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(user.id, 'rejected')}
                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => updateStatus(user.id, 'rejected')}
                          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Deactivate
                        </button>
                      )}
                      {user.status === 'rejected' && (
                        <button
                          onClick={() => updateStatus(user.id, 'active')}
                          className="rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="rounded-md bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}
