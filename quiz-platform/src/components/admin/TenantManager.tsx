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
  headerScript: string | null
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
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const emptyForm = {
    hostname: '',
    categoryId: categories[0]?.id || '',
    adClientId: '',
    bannerSlotId: '',
    interstitialSlotId: '',
    anchorSlotId: '',
    analyticsId: '',
    headerScript: '',
    adsTxtLines: '',
  }

  const [form, setForm] = useState(emptyForm)

  const openEditForm = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setForm({
      hostname: tenant.hostname,
      categoryId: tenant.categoryId,
      adClientId: tenant.adClientId,
      bannerSlotId: tenant.bannerSlotId,
      interstitialSlotId: tenant.interstitialSlotId,
      anchorSlotId: tenant.anchorSlotId,
      analyticsId: tenant.analyticsId || '',
      headerScript: tenant.headerScript || '',
      adsTxtLines: '',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingTenant) {
        // Update existing
        const res = await fetch('/api/admin/tenants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTenant.id,
            ...form,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to update tenant')
        }
        const updated = await res.json()
        setTenants(prev => prev.map(t => t.id === updated.id ? updated : t))
        setSuccess(`Tenant "${form.hostname}" updated successfully!`)
      } else {
        // Create new
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
        setSuccess(`Domain "${form.hostname}" is now LIVE! Point its DNS A record to your server IP.`)
      }

      setShowForm(false)
      setEditingTenant(null)
      setForm(emptyForm)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This will stop serving quizzes on this domain.')) return

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
      {/* Success message */}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* Add/Cancel Button */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => { setShowForm(!showForm); setEditingTenant(null); setForm(emptyForm); setError(''); setSuccess('') }}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          {showForm ? 'Cancel' : '+ Add New Domain'}
        </button>
      </div>

      {/* Provisioning Form */}
      {showForm && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 className="mb-1 text-lg font-bold text-gray-900">
            {editingTenant ? 'Edit Domain Configuration' : 'Add New Domain / Subdomain'}
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            {editingTenant
              ? 'Update the configuration for this domain.'
              : 'Add a domain or subdomain. Point its DNS A record to your server IP. It will start serving quizzes immediately.'
            }
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Domain & Category */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Domain & Category</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Domain / Subdomain *</label>
                  <input
                    type="text"
                    placeholder="quiz.yourdomain.com or yourdomain.com"
                    value={form.hostname}
                    onChange={e => setForm(prev => ({ ...prev, hostname: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">Point this domain&apos;s DNS A record to your server IP</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quiz Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.slug} — {cat.metaTitle}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400">Only this category&apos;s quizzes will show on this domain</p>
                </div>
              </div>
            </div>

            {/* Section 2: Ad Configuration */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Ad Configuration (Google AdSense / AdX)</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Publisher ID (data-ad-client) *</label>
                  <input
                    type="text"
                    placeholder="ca-pub-1234567890123456"
                    value={form.adClientId}
                    onChange={e => setForm(prev => ({ ...prev, adClientId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">Your unique AdSense/AdX publisher ID</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Banner Ad Slot ID *</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={form.bannerSlotId}
                    onChange={e => setForm(prev => ({ ...prev, bannerSlotId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">Top & bottom banner ads</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Interstitial Ad Slot ID *</label>
                  <input
                    type="text"
                    placeholder="0987654321"
                    value={form.interstitialSlotId}
                    onChange={e => setForm(prev => ({ ...prev, interstitialSlotId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">Step 4 loading screen (high CPM)</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Anchor Ad Slot ID *</label>
                  <input
                    type="text"
                    placeholder="1122334455"
                    value={form.anchorSlotId}
                    onChange={e => setForm(prev => ({ ...prev, anchorSlotId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">Sticky bottom anchor ad</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Google Analytics ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={form.analyticsId}
                    onChange={e => setForm(prev => ({ ...prev, analyticsId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">Optional: GA4 measurement ID</p>
                </div>
              </div>
            </div>

            {/* Section 3: Header & Verification */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Header Scripts & Verification</h3>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Custom Header Code</label>
                <textarea
                  placeholder={'<!-- Google site verification -->\n<meta name="google-site-verification" content="..." />\n\n<!-- Any custom scripts for <head> -->\n<script>...</script>'}
                  value={form.headerScript}
                  onChange={e => setForm(prev => ({ ...prev, headerScript: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">HTML/scripts injected in &lt;head&gt; — verification tags, custom meta, third-party scripts</p>
              </div>
            </div>

            {/* Section 4: Ads.txt */}
            {!editingTenant && (
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Ads.txt Configuration</h3>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ads.txt Lines (one per line)</label>
                  <textarea
                    placeholder="google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
                    value={form.adsTxtLines}
                    onChange={e => setForm(prev => ({ ...prev, adsTxtLines: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">Auto-served at domain.com/ads.txt — required for AdSense approval</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : editingTenant ? 'Update Domain' : 'Go Live — Provision Domain'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingTenant(null); setForm(emptyForm) }}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tenants Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
          <h3 className="text-sm font-bold text-gray-700">Active Domains ({tenants.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Publisher ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{tenant.hostname}</div>
                    <div className="text-xs text-gray-400">Added {new Date(tenant.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {tenant.category?.slug || tenant.categoryId}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                      tenant.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-gray-600">{tenant.adClientId}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => openEditForm(tenant)}
                      className="mr-3 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleStatusToggle(tenant)}
                      className="mr-3 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {tenant.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(tenant.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No domains configured. Click &quot;+ Add New Domain&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help section */}
      <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-5">
        <h3 className="mb-2 text-sm font-bold text-blue-900">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800">
          <li>Add your domain/subdomain above and select a quiz category</li>
          <li>Configure your AdSense/AdX ad slots (publisher ID + slot IDs)</li>
          <li>Point the domain&apos;s DNS A record to your server IP</li>
          <li>Domain goes live instantly — only the selected category&apos;s quizzes will appear</li>
          <li>Each domain has isolated ads — no shared ad codes between tenants</li>
        </ol>
      </div>
    </div>
  )
}
