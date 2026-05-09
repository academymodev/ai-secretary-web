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

const SILENT_URLS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/profile',
  '/auth/google/status',
  '/contacts/import-google',
  '/briefing/today',
  '/calendar/events',
  '/email/',
]

let redirecting  = false
let retryingUrls = new Set()

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !redirecting) {
      const url      = err.config?.url || ''
      const isSilent = SILENT_URLS.some((u) => url.includes(u))
      if (!isSilent) {
        if (!retryingUrls.has(url)) {
          retryingUrls.add(url)
          await new Promise((r) => setTimeout(r, 1500))
          retryingUrls.delete(url)
          try {
            return await client(err.config)
          } catch (retryErr) {
            if (retryErr.response?.status === 401 && !redirecting) {
              redirecting = true
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              window.location.href = '/login'
            }
            return Promise.reject(retryErr)
          }
        }
        redirecting = true
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
