'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  slug: string
  metaTitle: string
}

interface Tenant {
  id: string
  hostname: string
  status: string
  categoryId: string
  adClientId: string
  bannerSlotId: string
  interstitialSlotId: string
  anchorSlotId: string
  analyticsId: string | null
  createdAt: string
  category: Category
}

interface TenantManagerProps {
  initialTenants: Tenant[]
  categories: Category[]
}

export default function TenantManager({ initialTenants, categories }: TenantManagerProps) {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    hostname: '',
    categoryId: categories[0]?.id || '',
    adClientId: '',
    bannerSlotId: '',
    interstitialSlotId: '',
    anchorSlotId: '',
    analyticsId: '',
    adsTxtLines: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          adsTxtLines: form.adsTxtLines
            ? form.adsTxtLines.split('\n').filter(l => l.trim())
            : [],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create tenant')
      }

      const tenant = await res.json()
      setTenants(prev => [tenant, ...prev])
      setShowForm(false)
      setForm({
        hostname: '',
        categoryId: categories[0]?.id || '',
        adClientId: '',
        bannerSlotId: '',
        interstitialSlotId: '',
        anchorSlotId: '',
        analyticsId: '',
        adsTxtLines: '',
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return

    try {
      const res = await fetch(`/api/admin/tenants?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTenants(prev => prev.filter(t => t.id !== id))
        router.refresh()
      }
    } catch {
      // Handle error silently
    }
  }

  const handleStatusToggle = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'active' ? 'paused' : 'active'
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tenant.id, status: newStatus }),
      })
      if (res.ok) {
        setTenants(prev =>
          prev.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t)
        )
        router.refresh()
      }
    } catch {
      // Handle error silently
    }
  }

  return (
    <div>
      {/* Add Tenant Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add New Tenant (1-Min Provisioning)'}
        </button>
      </div>

      {/* Provisioning Form */}
      {showForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Tenant Provisioning</h2>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Hostname *</label>
              <input
                type="text"
                placeholder="crm.myblog.com"
                value={form.hostname}
                onChange={e => setForm(prev => ({ ...prev, hostname: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.slug} — {cat.metaTitle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Publisher ID (ad_client) *</label>
              <input
                type="text"
                placeholder="ca-pub-1234567890123456"
                value={form.adClientId}
                onChange={e => setForm(prev => ({ ...prev, adClientId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Banner Slot ID *</label>
              <input
                type="text"
                placeholder="1234567890"
                value={form.bannerSlotId}
                onChange={e => setForm(prev => ({ ...prev, bannerSlotId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Interstitial Slot ID *</label>
              <input
                type="text"
                placeholder="0987654321"
                value={form.interstitialSlotId}
                onChange={e => setForm(prev => ({ ...prev, interstitialSlotId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Anchor Slot ID *</label>
              <input
                type="text"
                placeholder="1122334455"
                value={form.anchorSlotId}
                onChange={e => setForm(prev => ({ ...prev, anchorSlotId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Analytics ID</label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={form.analyticsId}
                onChange={e => setForm(prev => ({ ...prev, analyticsId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Ads.txt Lines (one per line)</label>
              <textarea
                placeholder="google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
                value={form.adsTxtLines}
                onChange={e => setForm(prev => ({ ...prev, adsTxtLines: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Provision Tenant & Go Live'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tenants Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Hostname</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Publisher ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tenants.map(tenant => (
              <tr key={tenant.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{tenant.hostname}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{tenant.category?.slug || tenant.categoryId}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                    tenant.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{tenant.adClientId}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button
                    onClick={() => handleStatusToggle(tenant)}
                    className="mr-2 text-blue-600 hover:text-blue-800"
                  >
                    {tenant.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(tenant.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No tenants configured yet. Click &quot;Add New Tenant&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
