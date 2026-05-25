'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
            C
          </div>
          <h1 className="text-2xl font-bold text-white">CoolGanwar</h1>
          <p className="mt-1 text-sm text-slate-400">
            Multi-Tenant Quiz Monetization Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 flex rounded-xl border border-slate-700 bg-slate-800/50 p-1">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === 'login'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === 'signup'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {tab === 'login' ? <LoginForm /> : <SignupForm onSuccess={() => setTab('login')} />}
      </div>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-6 text-lg font-semibold text-white">Welcome back</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-300">
            Email or Username
          </label>
          <input
            id="login-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter email or admin username"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  )
}

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      setSuccess('Account created! Your account is pending admin approval. You will be able to login once approved.')
      setLoading(false)
      setTimeout(() => onSuccess(), 4000)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-6 text-lg font-semibold text-white">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-slate-300">
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-300">
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Min 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          By signing up, you agree to our Terms of Service. Your account will be activated after admin review.
        </p>
      </form>
    </div>
  )
}
