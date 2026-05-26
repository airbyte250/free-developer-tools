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
  headerScript: string | null
  customBannerCode: string | null
  quizBannerCode: string | null
  createdAt: string
  category: Category
}

interface TenantManagerProps {
  initialTenants: Tenant[]
  categories: Category[]
  serverIp: string
}

export default function TenantManager({ initialTenants, categories, serverIp }: TenantManagerProps) {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [showForm, setShowForm] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(false)
  const [sslLoading, setSslLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const emptyForm = {
    hostname: '',
    categoryId: categories[0]?.id || '',
    headerScript: '',
    customBannerCode: '',
    quizBannerCode: '',
    adsTxtLines: '',
  }

  const [form, setForm] = useState(emptyForm)

  const openEditForm = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setForm({
      hostname: tenant.hostname,
      categoryId: tenant.categoryId,
      headerScript: tenant.headerScript || '',
      customBannerCode: tenant.customBannerCode || '',
      quizBannerCode: tenant.quizBannerCode || '',
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
        setSuccess(`Domain "${form.hostname}" is now LIVE! Point its DNS A record to ${serverIp}`)
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

  const handleSSL = async (hostname: string) => {
    setSslLoading(hostname)
    try {
      const res = await fetch('/api/admin/ssl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(`SSL certificate generated for ${hostname}!`)
      } else {
        setError(data.error || 'SSL provisioning failed. If using Cloudflare, SSL works automatically with "Full" mode.')
      }
    } catch {
      setError('SSL request failed. If using Cloudflare proxy, SSL is handled automatically.')
    } finally {
      setSslLoading(null)
    }
  }

  return (
    <div>
      {/* Server IP Info Box */}
      <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">IP</div>
          <div>
            <p className="text-sm font-bold text-indigo-900">Server IP Address</p>
            <p className="font-mono text-lg font-bold text-indigo-700">{serverIp}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-indigo-600 font-medium">Cloudflare DNS Setup:</p>
            <p className="text-xs text-indigo-800">A Record → <span className="font-mono font-bold">{serverIp}</span> (Proxy: ON)</p>
            <p className="text-xs text-indigo-800">SSL Mode → <span className="font-bold">Full</span></p>
          </div>
        </div>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
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
              : `Add a domain or subdomain. Point DNS A record to ${serverIp}. It will start serving quizzes immediately.`
            }
          </p>

          {/* DNS Instructions */}
          {!editingTenant && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-amber-900">DNS Setup (Cloudflare)</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs text-amber-800">
                <li>Go to Cloudflare → DNS → Add Record</li>
                <li>Type: <span className="font-bold">A</span> | Name: <span className="font-bold">@</span> or subdomain | IP: <span className="font-mono font-bold">{serverIp}</span></li>
                <li>Proxy status: <span className="font-bold">Proxied (Orange cloud ON)</span></li>
                <li>SSL/TLS → Overview → Set to <span className="font-bold">&quot;Full&quot;</span></li>
              </ol>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Domain & Category */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">1. Domain & Category</h3>
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
                  <p className="mt-1 text-xs text-gray-400">Point A record to <span className="font-mono font-bold text-indigo-600">{serverIp}</span></p>
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

            {/* Section 2: Custom Banner Ad Code */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">2. Custom Banner Ad Code (Above Quiz)</h3>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Banner Ad HTML Code</label>
                <textarea
                  placeholder={'<!-- Custom banner ad code (shows above quiz) -->\n<ins class="adsbygoogle"\n  style="display:block"\n  data-ad-client="ca-pub-XXXXXX"\n  data-ad-slot="XXXXXX"\n  data-ad-format="auto"\n  data-full-width-responsive="true"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'}
                  value={form.customBannerCode}
                  onChange={e => setForm(prev => ({ ...prev, customBannerCode: e.target.value }))}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">Raw HTML/JS — displayed as banner ad directly above quiz questions</p>
              </div>
            </div>

            {/* Section: Quiz Banner Ad (inside quiz frame) */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">3. Quiz Frame Banner Ad</h3>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Banner Ad Code (inside quiz card, above question)</label>
                <textarea
                  placeholder={'<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="ca-pub-XXXXX"\n     data-ad-slot="XXXXX"\n     data-ad-format="auto"\n     data-full-width-responsive="true"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'}
                  value={form.quizBannerCode}
                  onChange={e => setForm(prev => ({ ...prev, quizBannerCode: e.target.value }))}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">Shows inside the quiz card frame, just above the question text</p>
              </div>
            </div>

            {/* Section 4: Custom Header Code */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">4. Custom Header Code ({"<head>"})</h3>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Header Scripts & Verification</label>
                <textarea
                  placeholder={'<!-- Google site verification -->\n<meta name="google-site-verification" content="..." />\n\n<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>\n<script>\nwindow.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag("js", new Date());\ngtag("config", "G-XXXXX");\n</script>\n\n<!-- AdSense Auto Ads -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX" crossorigin="anonymous"></script>'}
                  value={form.headerScript}
                  onChange={e => setForm(prev => ({ ...prev, headerScript: e.target.value }))}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">Injected in &lt;head&gt; — verification meta tags, GA code, AdSense auto-ads script, etc.</p>
              </div>
            </div>

            {/* Section 5: Ads.txt */}
            {!editingTenant && (
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">4. Ads.txt Configuration</h3>
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ads</th>
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
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-600">
                    {tenant.customBannerCode ? <span className="text-green-600 font-medium">Configured</span> : <span className="text-gray-400">Not set</span>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => openEditForm(tenant)}
                      className="mr-2 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSSL(tenant.hostname)}
                      disabled={sslLoading === tenant.hostname}
                      className="mr-2 text-emerald-600 hover:text-emerald-800 font-medium disabled:opacity-50"
                    >
                      {sslLoading === tenant.hostname ? 'SSL...' : 'SSL'}
                    </button>
                    <button
                      onClick={() => window.open(`https://${tenant.hostname}/api/clear-cookies`, '_blank')}
                      className="mr-2 text-amber-600 hover:text-amber-800 font-medium"
                    >
                      Cookies
                    </button>
                    <button
                      onClick={() => handleStatusToggle(tenant)}
                      className="mr-2 text-blue-600 hover:text-blue-800 font-medium"
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
        <h3 className="mb-2 text-sm font-bold text-blue-900">How Domain Setup Works</h3>
        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800">
          <li>Add your domain/subdomain above and select a quiz category</li>
          <li>Paste your custom ad code (banner above quiz + header scripts for AdSense/GA)</li>
          <li>In Cloudflare → DNS: Add <strong>A Record</strong> pointing to <span className="font-mono font-bold">{serverIp}</span> (Proxy ON)</li>
          <li>In Cloudflare → SSL/TLS: Set mode to <strong>&quot;Full&quot;</strong> — this handles SSL automatically</li>
          <li>Domain goes live instantly — only the selected category&apos;s quizzes will appear</li>
          <li>Each domain has completely isolated ads — no shared ad codes between tenants</li>
        </ol>
        <div className="mt-3 rounded-lg bg-white border border-blue-200 p-3">
          <p className="text-xs font-bold text-blue-900 mb-1">SSL Options:</p>
          <ul className="list-disc list-inside text-xs text-blue-800 space-y-0.5">
            <li><strong>Cloudflare (recommended):</strong> Set SSL mode to &quot;Full&quot; — automatic, no server config needed</li>
            <li><strong>Direct (no Cloudflare):</strong> Click &quot;SSL&quot; button in Actions to auto-generate Let&apos;s Encrypt certificate</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
