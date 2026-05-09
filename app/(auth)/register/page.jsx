'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const { signup, loading, loginHint } = useAuth()
  const router                         = useRouter()
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    const res = await signup(form.name, form.email, form.password)
    if (res.ok) {
      setSuccess('Account created! Please sign in.')
      setTimeout(() => router.push('/login'), 1500)
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="card w-full max-w-sm p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl overflow-hidden mb-5 shadow-sm">
            <img src="/logo192.png" alt="Modev Secretary" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-sm text-fg-muted mt-1">Get started with Modev Secretary</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error   && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-positive bg-positive-subtle px-3 py-2 rounded-lg">{success}</p>}
          <div>
            <label className="label">Full Name</label>
            <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-dim hover:text-fg-muted transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          {loginHint && <p className="text-xs text-center text-fg-dim animate-pulse">{loginHint}</p>}
        </form>

        <p className="text-sm text-center text-fg-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-fg font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
