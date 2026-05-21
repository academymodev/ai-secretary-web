'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import client from '@/lib/api'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export default function LoginPage() {
  const { login, loginWithGoogle, loading, loginHint } = useAuth()
  const router                        = useRouter()
  const [form, setForm]               = useState({ email: '', password: '' })
  const [showPw, setShowPw]           = useState(false)
  const [error, setError]             = useState('')
  const [serverReady, setServerReady] = useState(false)
  const tokenClientRef                = useRef(null)

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

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) { setError('Google sign-in was cancelled.'); return }
          const res = await loginWithGoogle(response.access_token)
          if (res.ok) router.push('/dashboard')
          else setError(res.error)
        },
      })
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handleGoogleSignIn = () => {
    setError('')
    tokenClientRef.current?.requestAccessToken()
  }

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

        {GOOGLE_CLIENT_ID && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--fg-dim)]">or</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium text-[var(--fg)] disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </>
        )}

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
