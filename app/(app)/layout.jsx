'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Layout from '@/components/Layout'

export default function AppLayout({ children }) {
  const { token, initialized } = useAuth()
  const router                 = useRouter()

  useEffect(() => {
    if (initialized && !token) router.replace('/login')
  }, [token, initialized])

  if (!initialized) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    </div>
  )
  if (!token) return null

  return <Layout>{children}</Layout>
}
