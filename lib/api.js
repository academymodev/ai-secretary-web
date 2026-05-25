'use client'
import axios from 'axios'

const BASE_URL = process.env.NODE_ENV === 'development'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
  : '/api'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth endpoints that return 401 legitimately (wrong credentials) — never redirect on these
const SILENT_401_URLS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
]

// Single flag to prevent duplicate redirects when several requests 401 concurrently
let redirectingToLogin = false

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const url      = err.config?.url || ''
      const isSilent = SILENT_401_URLS.some((u) => url.includes(u))
      if (!isSilent && !redirectingToLogin) {
        redirectingToLogin = true
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default client
export { BASE_URL }
