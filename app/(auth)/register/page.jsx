'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const { sendSignupOtp, signup, loading, loginHint } = useAuth()
  const router = useRouter()

  const [step, setStep]           = useState(1)
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' })
  const [otp, setOtp]             = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState('')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submitStep1 = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 10) return setError('Password must be at least 10 characters')
    if (!/[A-Z]/.test(form.password)) return setError('Password must contain an uppercase letter')
    if (!/[0-9]/.test(form.password)) return setError('Password must contain a number')
    const res = await sendSignupOtp(form.name, form.email, form.password)
    if (res.ok) {
      setStep(2)
    } else {
      setError(res.error)
    }
  }

  const submitStep2 = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) return setError('Please enter the 6-digit code')
    const res = await signup(form.name, form.email, form.password, otp)
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError(res.error)
    }
  }

  const resendOtp = async () => {
    setError('')
    setResendMsg('')
    setResending(true)
    const res = await sendSignupOtp(form.name, form.email, form.password)
    setResending(false)
    if (res.ok) setResendMsg('New code sent!')
    else setError(res.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="card w-full max-w-sm p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl overflow-hidden mb-5 shadow-sm">
            <img src="/logo192.png" alt="Modev Secretary" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {step === 1 ? 'Get started with Modev Secretary' : `Code sent to ${form.email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={submitStep1} className="space-y-4">
            {error && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
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
                <input
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 10 chars, uppercase, number"
                  value={form.password}
                  onChange={set('password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-dim hover:text-fg-muted transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending code…' : 'Continue'}
            </button>
            {loginHint && <p className="text-xs text-center text-fg-dim animate-pulse">{loginHint}</p>}
          </form>
        ) : (
          <form onSubmit={submitStep2} className="space-y-4">
            {error    && <p className="text-sm text-danger   bg-danger-subtle   px-3 py-2 rounded-lg">{error}</p>}
            {resendMsg && <p className="text-sm text-positive bg-positive-subtle px-3 py-2 rounded-lg">{resendMsg}</p>}
            <div>
              <label className="label">Verification Code</label>
              <input
                className="input text-center text-2xl tracking-[0.5em] font-mono"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                required
              />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Verify & Create Account'}
            </button>
            <p className="text-sm text-center text-fg-muted">
              Didn't receive it?{' '}
              <button
                type="button"
                onClick={resendOtp}
                disabled={resending || loading}
                className="text-fg font-semibold hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            </p>
            <p className="text-sm text-center">
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setOtp(''); setResendMsg('') }}
                className="text-fg-muted hover:text-fg hover:underline transition-colors"
              >
                ← Change details
              </button>
            </p>
            {loginHint && <p className="text-xs text-center text-fg-dim animate-pulse">{loginHint}</p>}
          </form>
        )}

        <p className="text-sm text-center text-fg-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-fg font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
