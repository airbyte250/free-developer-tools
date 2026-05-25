'use client'

import { useState, useEffect, useCallback } from 'react'

interface QuizStep {
  step: number
  question: string
  options: string[]
}

interface QuizItem {
  slug: string
  title: string
  description: string
  article: string
  steps: QuizStep[]
  resultLogic: { type: string; message: string }
}

interface QuizRow {
  categoryId: string
  categorySlug: string
  categoryTitle: string
  quiz: QuizItem
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editOriginalSlug, setEditOriginalSlug] = useState('')
  const [categories, setCategories] = useState<{ id: string; slug: string; metaTitle: string }[]>([])

  // Form state
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formArticle, setFormArticle] = useState('')
  const [formSteps, setFormSteps] = useState<QuizStep[]>([
    { step: 1, question: '', options: ['', '', '', ''] },
    { step: 2, question: '', options: ['', '', '', ''] },
    { step: 3, question: '', options: ['', '', '', ''] },
    { step: 4, question: 'Analyzing...', options: [] },
    { step: 5, question: '', options: ['', '', '', ''] },
  ])
  const [formResultMessage, setFormResultMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchQuizzes = useCallback(async () => {
    const res = await fetch('/api/admin/quizzes')
    if (res.ok) {
      const data = await res.json()
      setQuizzes(data)
    }
    setLoading(false)
  }, [])

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/admin/categories')
    if (res.ok) {
      const data = await res.json()
      setCategories(data.map((c: { id: string; slug: string; metaTitle: string }) => ({
        id: c.id,
        slug: c.slug,
        metaTitle: c.metaTitle,
      })))
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
    fetchCategories()
  }, [fetchQuizzes, fetchCategories])

  const resetForm = () => {
    setFormCategoryId('')
    setFormSlug('')
    setFormTitle('')
    setFormDescription('')
    setFormArticle('')
    setFormSteps([
      { step: 1, question: '', options: ['', '', '', ''] },
      { step: 2, question: '', options: ['', '', '', ''] },
      { step: 3, question: '', options: ['', '', '', ''] },
      { step: 4, question: 'Analyzing...', options: [] },
      { step: 5, question: '', options: ['', '', '', ''] },
    ])
    setFormResultMessage('')
    setEditMode(false)
    setEditOriginalSlug('')
  }

  const handleEdit = (row: QuizRow) => {
    setEditMode(true)
    setEditOriginalSlug(row.quiz.slug)
    setFormCategoryId(row.categoryId)
    setFormSlug(row.quiz.slug)
    setFormTitle(row.quiz.title)
    setFormDescription(row.quiz.description)
    setFormArticle(row.quiz.article)
    setFormSteps(row.quiz.steps.length > 0 ? row.quiz.steps : [
      { step: 1, question: '', options: ['', '', '', ''] },
      { step: 2, question: '', options: ['', '', '', ''] },
      { step: 3, question: '', options: ['', '', '', ''] },
      { step: 4, question: 'Analyzing...', options: [] },
      { step: 5, question: '', options: ['', '', '', ''] },
    ])
    setFormResultMessage(row.quiz.resultLogic?.message || '')
    setShowForm(true)
  }

  const handleDelete = async (row: QuizRow) => {
    if (!confirm(`Delete quiz "${row.quiz.title}" from ${row.categorySlug}?`)) return
    const res = await fetch(`/api/admin/quizzes?categoryId=${row.categoryId}&slug=${row.quiz.slug}`, { method: 'DELETE' })
    if (res.ok) {
      setMessage('Quiz deleted successfully')
      fetchQuizzes()
    } else {
      const data = await res.json()
      setMessage(`Error: ${data.error}`)
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const quizPayload: QuizItem = {
      slug: formSlug,
      title: formTitle,
      description: formDescription,
      article: formArticle,
      steps: formSteps,
      resultLogic: { type: 'score', message: formResultMessage || 'Assessment complete. Your results are ready.' },
    }

    const url = '/api/admin/quizzes'
    const method = editMode ? 'PUT' : 'POST'
    const body = editMode
      ? { categoryId: formCategoryId, originalSlug: editOriginalSlug, quiz: quizPayload }
      : { categoryId: formCategoryId, quiz: quizPayload }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setMessage(editMode ? 'Quiz updated successfully' : 'Quiz created successfully')
      setShowForm(false)
      resetForm()
      fetchQuizzes()
    } else {
      const data = await res.json()
      setMessage(`Error: ${data.error}`)
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const updateStep = (stepIdx: number, field: 'question' | 'options', value: string | string[]) => {
    setFormSteps(prev => prev.map((s, i) => i === stepIdx ? { ...s, [field]: value } : s))
  }

  const filteredQuizzes = filter
    ? quizzes.filter(q => q.categorySlug === filter)
    : quizzes

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Quiz Management</h1>
          <p className="mt-1 text-sm text-gray-500">{quizzes.length} quizzes across {categories.length} categories</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add New Quiz
        </button>
      </div>

      {message && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.metaTitle}</option>
          ))}
        </select>
      </div>

      {/* Quiz List */}
      <div className="space-y-3">
        {filteredQuizzes.map((row, idx) => (
          <div key={`${row.categoryId}-${row.quiz.slug}-${idx}`} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900">{row.quiz.title}</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700">{row.categorySlug}</span>
                  <span className="ml-2">slug: {row.quiz.slug}</span>
                  <span className="ml-2">{row.quiz.steps.length} steps</span>
                  {row.quiz.article && <span className="ml-2 text-green-600">Has article</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(row)}
                  className="rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500">No quizzes found. Create your first quiz above.</p>
      )}

      {/* Add/Edit Quiz Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-2xl md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editMode ? 'Edit Quiz' : 'Add New Quiz'}</h2>
              <button onClick={() => { setShowForm(false); resetForm() }} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formCategoryId}
                  onChange={e => setFormCategoryId(e.target.value)}
                  required
                  disabled={editMode}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                >
                  <option value="">Select category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.metaTitle} ({c.slug})</option>
                  ))}
                </select>
              </div>

              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={e => setFormSlug(e.target.value)}
                    required
                    placeholder="my-quiz-slug"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    required
                    placeholder="Quiz Title"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Short description of the quiz"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Quiz Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Quiz Steps (Questions)</label>
                <div className="mt-2 space-y-3">
                  {formSteps.map((step, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-200 p-3">
                      <div className="mb-2 text-xs font-medium text-gray-500">Step {step.step}{step.step === 4 ? ' (Interstitial - auto)' : ''}</div>
                      {step.step !== 4 && (
                        <>
                          <input
                            type="text"
                            value={step.question}
                            onChange={e => updateStep(idx, 'question', e.target.value)}
                            placeholder={`Question for step ${step.step}`}
                            className="mb-2 w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {step.options.map((opt, optIdx) => (
                              <input
                                key={optIdx}
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const newOpts = [...step.options]
                                  newOpts[optIdx] = e.target.value
                                  updateStep(idx, 'options', newOpts)
                                }}
                                placeholder={`Option ${optIdx + 1}`}
                                className="rounded border border-gray-200 px-2 py-1.5 text-xs"
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Result Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Result Message</label>
                <textarea
                  value={formResultMessage}
                  onChange={e => setFormResultMessage(e.target.value)}
                  rows={2}
                  placeholder="Message shown after quiz completion"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {/* Article (HTML) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Article (HTML) — displayed below quiz results</label>
                <textarea
                  value={formArticle}
                  onChange={e => setFormArticle(e.target.value)}
                  rows={8}
                  placeholder="<h2>Article Title</h2><p>Full article content in HTML...</p>"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editMode ? 'Update Quiz' : 'Create Quiz'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm() }}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
