'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthLayout({ children }) {
  const { token, initialized } = useAuth()
  const router                 = useRouter()

  useEffect(() => {
    if (initialized && token) router.replace('/dashboard')
  }, [token, initialized])

  return <>{children}</>
}
