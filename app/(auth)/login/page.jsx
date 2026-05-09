'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import client from '@/lib/api'

export default function LoginPage() {
  const { login, loading, loginHint } = useAuth()
  const router                        = useRouter()
  const [form, setForm]               = useState({ email: '', password: '' })
  const [showPw, setShowPw]           = useState(false)
  const [error, setError]             = useState('')
  const [serverReady, setServerReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const warm = async () => {
      for (let i = 0; i < 20; i++) {
        try {
          await client.get('/health')
          if (!cancelled) setServerReady(true)
          return
        } catch {
          if (cancelled) return
          await new Promise(r => setTimeout(r, 4000))
        }
      }
      if (!cancelled) setServerReady(true)
    }
    warm()
    return () => { cancelled = true }
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(form.email, form.password)
    if (res.ok) router.push('/dashboard')
    else setError(res.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div
        className="card w-full max-w-sm p-8"
        style={{ boxShadow: '0 24px 64px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)', animation: 'modalEnter 0.28s var(--ease-out) both' }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-[18px] overflow-hidden mb-4 shadow-sm">
            <img src="/logo192.png" alt="Modev Secretary" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--fg)]">Modev Secretary</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <p className="text-xs text-[var(--error)] bg-[var(--error-subtle)] px-3 py-2.5 rounded-xl leading-relaxed">{error}</p>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)] hover:text-[var(--fg-muted)] transition-colors">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="text-right -mt-1">
            <Link href="/forgot-password" className="text-xs text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors">
              Forgot password?
            </Link>
          </div>

          {!serverReady && !loading && (
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--fg-dim)] animate-pulse" />
              <span className="text-xs text-[var(--fg-dim)]">Connecting to server…</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {loginHint && (
            <p className="text-xs text-center text-[var(--fg-dim)] animate-pulse">{loginHint}</p>
          )}
        </form>

        <p className="text-xs text-center text-[var(--fg-muted)] mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-[var(--fg)] hover:underline">Create one</Link>
        </p>
        <p className="text-[10px] text-center text-[var(--fg-dim)] mt-3">
          <Link href="/privacy" className="hover:text-[var(--fg)] transition-colors">Privacy</Link>
          {' · '}
          <Link href="/terms" className="hover:text-[var(--fg)] transition-colors">Terms</Link>
        </p>
      </div>
    </div>
  )
}
