'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import client from '@/lib/api'

export default function ForgotPassword() {
  const router            = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await client.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code')
    } finally { setLoading(false) }
  }

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold mb-2">Check your email</h2>
        <p className="text-fg-muted text-sm mb-6">We sent a 6-digit reset code to <strong>{email}</strong>. It expires in 15 minutes.</p>
        <button className="btn-primary w-full" onClick={() => router.push('/reset-password')}>
          Enter Reset Code
        </button>
        <button onClick={() => setSent(false)} className="mt-3 text-sm text-fg-muted hover:underline">Resend code</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="card w-full max-w-sm p-8">
        <Link href="/login" className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg transition-colors mb-6">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4">
            <img src="/logo192.png" alt="Modev Secretary" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-fg-muted mt-1 text-center">Enter your email to receive a reset code</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending…' : 'Send Reset Code'}
          </button>
        </form>
      </div>
    </div>
  )
}
