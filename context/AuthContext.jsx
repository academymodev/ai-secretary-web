'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import client from '@/lib/api'

const AuthContext = createContext(null)

const safeParseUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const safeGetToken = () => {
  if (typeof window === 'undefined') return null
  const t = localStorage.getItem('token')
  if (!t || t === 'undefined' || t === 'null') {
    localStorage.removeItem('token')
    return null
  }
  return t
}

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [token, setToken]         = useState(null)
  const [initialized, setInit]    = useState(false)
  const [loading, setLoading]     = useState(false)
  const [loginHint, setLoginHint] = useState('')

  useEffect(() => {
    setUser(safeParseUser())
    setToken(safeGetToken())
    setInit(true)
  }, [])

  useEffect(() => {
    if (!initialized) return
    const storedToken = safeGetToken()
    if (!storedToken) return
    client.get('/auth/profile').then(({ data }) => {
      const u = { name: data.user.name, email: data.user.email, google_connected: data.user.google_connected }
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
    }).catch(() => {})
  }, [initialized])

  const saveSession = (t, u) => {
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  const isRetryable = (e) => {
    if (!e.response) return true
    const s = e.response.status
    return s === 502 || s === 503 || s === 504
  }

  const postWithRetry = async (url, body, onRetry) => {
    for (let attempt = 0; attempt <= 12; attempt++) {
      try {
        return await client.post(url, body)
      } catch (e) {
        if (!isRetryable(e) || attempt === 12) throw e
        if (attempt === 0) onRetry?.()
        await sleep(attempt < 4 ? 4000 : 6000)
      }
    }
  }

  const apiError = (e, fallback) =>
    e.response?.data?.error || e.response?.data?.message || fallback

  const login = async (email, password) => {
    setLoading(true)
    setLoginHint('')
    try {
      const { data } = await postWithRetry(
        '/auth/login',
        { email, password, deviceName: 'Web Browser', deviceType: 'web' },
        () => setLoginHint('Server is waking up, please wait (~30 seconds)…')
      )
      saveSession(data.token, { name: data.user.name, email: data.user.email })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: apiError(e, 'Unable to reach server. Please try again.') }
    } finally {
      setLoading(false)
      setLoginHint('')
    }
  }

  const sendSignupOtp = async (name, email, password) => {
    setLoading(true)
    setLoginHint('')
    try {
      await postWithRetry('/auth/send-signup-otp', { name, email, password }, () =>
        setLoginHint('Server is waking up, please wait (~30 seconds)…')
      )
      return { ok: true }
    } catch (e) {
      return { ok: false, error: apiError(e, 'Unable to reach server. Please try again.') }
    } finally {
      setLoading(false)
      setLoginHint('')
    }
  }

  const signup = async (name, email, password, otp) => {
    setLoading(true)
    setLoginHint('')
    try {
      const { data } = await postWithRetry('/auth/signup', { name, email, password, otp }, () =>
        setLoginHint('Server is waking up, please wait (~30 seconds)…')
      )
      if (otp && data.token) {
        saveSession(data.token, { name: data.user.name, email: data.user.email })
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: apiError(e, 'Unable to reach server. Please try again.') }
    } finally {
      setLoading(false)
      setLoginHint('')
    }
  }

  const loginWithGoogle = async (accessToken) => {
    setLoading(true)
    setLoginHint('')
    try {
      const { data } = await postWithRetry(
        '/auth/google-mobile',
        { access_token: accessToken },
        () => setLoginHint('Server is waking up, please wait (~30 seconds)…')
      )
      saveSession(data.token, { name: data.user.name, email: data.user.email })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: apiError(e, 'Google sign-in failed. Please try again.') }
    } finally {
      setLoading(false)
      setLoginHint('')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, initialized, loading, loginHint, login, loginWithGoogle, sendSignupOtp, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext) ?? {
    user: null, token: null, initialized: false, loading: false, loginHint: '',
    login: async () => ({}), loginWithGoogle: async () => ({}), signup: async () => ({}), logout: () => {},
  }
