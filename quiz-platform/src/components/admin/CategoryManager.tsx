'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  slug: string
  metaTitle: string
  metaDescription: string
  quizData: unknown
  _count?: { tenants: number }
}

const DEFAULT_QUIZ_DATA = {
  title: 'Enterprise Assessment',
  steps: [
    {
      step: 1,
      question: 'What is your current CRM solution?',
      options: ['Salesforce', 'HubSpot', 'Zoho CRM', 'Custom/In-house', 'None'],
    },
    {
      step: 2,
      question: 'How many leads does your sales team process monthly?',
      options: ['Under 100', '100-500', '500-2,000', '2,000-10,000', '10,000+'],
    },
    {
      step: 3,
      question: 'What is your biggest pipeline bottleneck?',
      options: ['Lead Qualification', 'Follow-up Automation', 'Data Integration', 'Reporting & Analytics', 'Team Collaboration'],
    },
    {
      step: 4,
      question: 'What is your annual marketing technology budget?',
      options: ['Under $10K', '$10K-$50K', '$50K-$200K', '$200K-$1M', '$1M+'],
    },
    {
      step: 5,
      question: 'What ROI improvement would justify a new platform investment?',
      options: ['10-20%', '20-40%', '40-60%', '60-100%', '100%+'],
    },
  ],
  resultLogic: {
    type: 'score',
    message: 'Based on your enterprise profile, you qualify for our Premium CRM Automation tier with 47% higher ROI potential.',
  },
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    slug: '',
    metaTitle: '',
    metaDescription: '',
    quizDataJson: JSON.stringify(DEFAULT_QUIZ_DATA, null, 2),
  })

  const resetForm = () => {
    setForm({
      slug: '',
      metaTitle: '',
      metaDescription: '',
      quizDataJson: JSON.stringify(DEFAULT_QUIZ_DATA, null, 2),
    })
    setEditingId(null)
    setError('')
  }

  const handleEdit = (cat: Category) => {
    setForm({
      slug: cat.slug,
      metaTitle: cat.metaTitle,
      metaDescription: cat.metaDescription,
      quizDataJson: JSON.stringify(cat.quizData, null, 2),
    })
    setEditingId(cat.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let quizData: unknown
    try {
      quizData = JSON.parse(form.quizDataJson)
    } catch {
      setError('Invalid JSON in Quiz Data field')
      setLoading(false)
      return
    }

    const payload = {
      slug: form.slug,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      quizData,
      ...(editingId ? { id: editingId } : {}),
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save category')
      }

      setShowForm(false)
      resetForm()
      router.refresh()

      // Refetch categories
      const listRes = await fetch('/api/admin/categories')
      if (listRes.ok) {
        setCategories(await listRes.json())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete')
        return
      }
      setCategories(prev => prev.filter(c => c.id !== id))
      router.refresh()
    } catch {
      // Handle error silently
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add New Category'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h2>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Slug *</label>
                <input
                  type="text"
                  placeholder="b2b-saas-crm"
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Meta Title *</label>
                <input
                  type="text"
                  placeholder="Premium CRM Lead Management Automation"
                  value={form.metaTitle}
                  onChange={e => setForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Meta Description *</label>
              <textarea
                placeholder="Enterprise-grade CRM assessment for lead management, customer retention, and ROI optimization..."
                value={form.metaDescription}
                onChange={e => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quiz Data (JSON) *</label>
              <textarea
                value={form.quizDataJson}
                onChange={e => setForm(prev => ({ ...prev, quizDataJson: e.target.value }))}
                rows={20}
                className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="grid gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{cat.slug}</h3>
                <p className="mt-1 text-sm font-medium text-gray-700">{cat.metaTitle}</p>
                <p className="mt-1 text-sm text-gray-500">{cat.metaDescription}</p>
                {cat._count && (
                  <p className="mt-2 text-xs text-gray-400">{cat._count.tenants} tenant(s) using this category</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cat)}
                  className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-sm text-gray-500">No categories yet. Create one to get started.</p>
        )}
      </div>
    </div>
  )
}
