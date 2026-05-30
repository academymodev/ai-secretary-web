'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import client from '@/lib/api'

function ResetPasswordForm() {
  const router              = useRouter()
  const searchParams        = useSearchParams()
  const emailFromUrl        = searchParams.get('email') || ''
  const [form, setForm]     = useState({ otp: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!emailFromUrl) return setError('Email address missing — please go back and restart the reset flow')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      await client.post('/auth/reset-password', { email: emailFromUrl, otp: form.otp, newPassword: form.password })
      router.push('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="card w-full max-w-sm p-8">
        <Link href="/forgot-password" className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg transition-colors mb-6">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
        <p className="text-sm text-fg-muted mb-6">Enter the 6-digit code from your email</p>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">Reset Code</label>
            <input className="input tracking-widest text-center text-lg" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={form.otp} onChange={set('otp')} required />
          </div>
          <div>
            <label className="label">New Password</label>
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
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
