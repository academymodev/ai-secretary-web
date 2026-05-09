'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, Users, Bot,
  Mail, Calendar, Settings, LogOut, Menu, Bell, Search, X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import client from '@/lib/api'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks',     label: 'Tasks',     icon: CheckSquare },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/contacts',  label: 'Contacts',  icon: Users },
  { href: '/chat',      label: 'Chat',      icon: Bot },
  { href: '/email',     label: 'Email',     icon: Mail },
  { href: '/calendar',  label: 'Calendar',  icon: Calendar },
  { href: '/settings',  label: 'Settings',  icon: Settings },
]

function GlobalSearch() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const ref                   = useRef(null)
  const router                = useRouter()

  useEffect(() => {
    const down = (e) => { if (e.key === 'Escape') { setQuery(''); setResults(null) } }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults(null); return }
    const id = setTimeout(async () => {
      setLoading(true)
      try {
        const [contacts, tasks] = await Promise.allSettled([
          client.get('/contacts'),
          client.get('/tasks'),
        ])
        const q              = query.toLowerCase()
        const matchedContacts = (contacts.value?.data?.all || contacts.value?.data?.contacts || [])
          .filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
          .slice(0, 4)
        const matchedTasks = (tasks.value?.data?.tasks || [])
          .filter(t => t.title?.toLowerCase().includes(q))
          .slice(0, 4)
        setResults({ contacts: matchedContacts, tasks: matchedTasks })
      } finally { setLoading(false) }
    }, 280)
    return () => clearTimeout(id)
  }, [query])

  const go    = (path) => { router.push(path); setQuery(''); setResults(null) }
  const total = (results?.contacts?.length || 0) + (results?.tasks?.length || 0)

  return (
    <div className="relative" ref={ref}>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
        focused
          ? 'border-[var(--border-focus)] bg-[var(--surface)]'
          : 'border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface)]'
      }`}>
        <Search size={12} className="text-[var(--fg-dim)] shrink-0" />
        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="bg-transparent text-xs outline-none w-full text-[var(--fg)] placeholder:text-[var(--fg-dim)]"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null) }} className="shrink-0">
            <X size={10} className="text-[var(--fg-dim)]" />
          </button>
        )}
      </div>

      {query && focused && (
        <div className="absolute top-full mt-1.5 left-0 right-0 card z-50 overflow-hidden py-1"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          {loading && <p className="text-xs text-[var(--fg-dim)] px-3 py-2.5">Searching…</p>}
          {!loading && results && total === 0 && (
            <p className="text-xs text-[var(--fg-muted)] px-3 py-3">No results for "{query}"</p>
          )}
          {!loading && results?.tasks?.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-[var(--fg-dim)] uppercase tracking-[0.1em] px-3 pt-2.5 pb-1">Tasks</p>
              {results.tasks.map(t => (
                <button key={t.id} onClick={() => go('/tasks')}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--surface-raised)] text-xs truncate transition-colors text-[var(--fg)]">
                  {t.title}
                </button>
              ))}
            </div>
          )}
          {!loading && results?.contacts?.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-[var(--fg-dim)] uppercase tracking-[0.1em] px-3 pt-2.5 pb-1">Contacts</p>
              {results.contacts.map(c => (
                <button key={c.id} onClick={() => go('/contacts')}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--surface-raised)] text-xs truncate transition-colors text-[var(--fg)]">
                  {c.name}
                  {c.email && <span className="text-[var(--fg-dim)]"> · {c.email}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NavItem({ href, label, icon: Icon }) {
  const pathname  = usePathname()
  const isActive  = pathname === href

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-[var(--surface-overlay)] text-[var(--fg)] font-semibold'
          : 'text-[var(--fg-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--fg)]'
      }`}
    >
      <Icon size={16} className={`shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
      <span className="tracking-tight">{label}</span>
    </Link>
  )
}

function Sidebar({ user, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-5 mb-1">
        <div className="w-7 h-7 rounded-[10px] overflow-hidden shrink-0">
          <img src="/logo192.png" alt="Modev Secretary" className="w-full h-full object-cover" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-[var(--fg)]">Modev Secretary</span>
      </div>

      <div className="px-3 pb-3">
        <GlobalSearch />
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => <NavItem key={item.href} {...item} />)}
      </nav>

      <div className="p-3 mt-auto border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-6 h-6 rounded-full bg-[var(--brand-strong)] text-[var(--brand-fg)] flex items-center justify-center text-[10px] font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-tight truncate text-[var(--fg)]">{user?.name}</p>
            <p className="text-[10px] truncate text-[var(--fg-dim)]">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-[var(--fg-dim)] hover:text-danger hover:bg-[var(--error-subtle)] transition-all duration-150"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const router           = useRouter()
  const pathname         = usePathname()
  const [open, setOpen]  = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  const handleLogout = () => { logout(); router.push('/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-[var(--bg-subtle)] border-r border-[var(--border)]">
        <Sidebar user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.15s ease both' }}
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-60 bg-[var(--bg-subtle)] border-r border-[var(--border)]"
            style={{ animation: 'modalEnter 0.2s var(--ease-out) both' }}>
            <Sidebar user={user} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[var(--bg-subtle)] border-b border-[var(--border)]">
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-xl hover:bg-[var(--surface-raised)] transition-colors">
            <Menu size={18} className="text-[var(--fg-muted)]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[8px] overflow-hidden">
              <img src="/logo192.png" alt="Modev Secretary" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Modev Secretary</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-3xl mx-auto w-full page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
