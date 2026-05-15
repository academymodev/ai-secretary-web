'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, LogOut, CheckCircle2, ExternalLink, ChevronRight, RefreshCw, Save, Download, Trash2, CalendarDays, Mail, ListTodo, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'
import client from '@/lib/api'

const BRIEFING_SECTIONS = [
  { key: 'meetings',  label: 'Meetings',   icon: CalendarDays },
  { key: 'tasks',     label: 'Tasks',      icon: ListTodo     },
  { key: 'emails',    label: 'Emails',     icon: Mail         },
  { key: 'followups', label: 'Follow-ups', icon: Users        },
]

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <p className="section-label">{title}</p>
      {children}
    </div>
  )
}

function RowField({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function GoogleLogo({ dim }) {
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] ${dim ? 'opacity-60' : ''}`}>
      <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout }          = useAuth()
  const { theme, changeTheme }    = useTheme()
  const router                    = useRouter()
  const [showLogout, setShowLogout]           = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deletingAccount, setDeletingAccount]     = useState(false)
  const [googleConnected, setGoogleConnected] = useState(user?.google_connected || false)
  const [checking, setChecking]               = useState(false)
  const [profile, setProfile]             = useState({ name: user?.name || '', briefing_time: '06:55', language: 'english', mode: 'professional' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)
  const [profileError, setProfileError]   = useState('')
  const [briefingSections, setBriefingSections] = useState(['meetings','tasks','emails','followups'])
  const [calendars, setCalendars]               = useState([])
  const [selectedCalIds, setSelectedCalIds]     = useState([])
  const [loadingCals, setLoadingCals]           = useState(false)

  const apiBase   = process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
    : '/api'
  const token     = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const googleUrl = `${apiBase}/auth/google?token=${token}`

  const checkGoogleStatus = async () => {
    setChecking(true)
    try {
      const { data } = await client.get('/auth/google/status')
      setGoogleConnected(data.connected)
    } catch {} finally { setChecking(false) }
  }

  const loadCalendars = async () => {
    setLoadingCals(true)
    try {
      const { data } = await client.get('/calendar/list')
      setCalendars(data.calendars || [])
      setSelectedCalIds(data.selectedIds || [])
    } catch {} finally { setLoadingCals(false) }
  }

  const toggleCalendar = (id) => {
    setSelectedCalIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleBriefingSection = (key) => {
    setBriefingSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  useEffect(() => {
    checkGoogleStatus()
    const onFocus = () => checkGoogleStatus()
    window.addEventListener('focus', onFocus)
    client.get('/auth/profile').then(({ data }) => {
      const u = data.user
      setProfile({
        name:          u.name          || user?.name || '',
        briefing_time: u.briefing_time || '06:55',
        language:      u.language      || 'english',
        mode:          u.mode          || 'professional',
      })
      if (u.briefing_sections) setBriefingSections(u.briefing_sections.split(',').filter(Boolean))
      if (u.calendar_ids)      setSelectedCalIds(u.calendar_ids.split(',').filter(Boolean))
    }).catch(() => {})
    loadCalendars()
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const saveProfile = async () => {
    setSavingProfile(true)
    setProfileError('')
    setProfileSaved(false)
    try {
      await client.put('/auth/profile', {
        ...profile,
        briefing_sections: briefingSections.join(','),
        calendar_ids:      selectedCalIds.join(','),
      })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to save')
    } finally { setSavingProfile(false) }
  }

  const handleLogout = () => { logout(); router.push('/login') }

  const exportData = async () => {
    try {
      const { data } = await client.get('/auth/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'my-data-export.json'; a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const deleteAccount = async () => {
    setDeletingAccount(true)
    try {
      await client.delete('/auth/account')
      logout()
      router.push('/login')
    } catch { setDeletingAccount(false); setShowDeleteAccount(false) }
  }

  return (
    <div className="space-y-4">
      <div className="pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Settings</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--brand-strong)] text-[var(--brand-fg)] flex items-center justify-center text-xl font-bold shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-base text-[var(--fg)] tracking-tight truncate">{user?.name}</p>
          <p className="text-sm text-[var(--fg-muted)] truncate">{user?.email}</p>
        </div>
      </div>

      <Section title="Profile">
        <div className="space-y-3">
          <RowField label="Display Name">
            <input className="input" value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </RowField>
          <RowField label="Briefing Time">
            <input className="input" type="time" value={profile.briefing_time}
              onChange={e => setProfile(p => ({ ...p, briefing_time: e.target.value }))} />
          </RowField>
          <RowField label="Language">
            <select className="input" value={profile.language}
              onChange={e => setProfile(p => ({ ...p, language: e.target.value }))}>
              {[
                ['english','English'],['hindi','Hindi'],['tamil','Tamil'],['telugu','Telugu'],
                ['kannada','Kannada'],['malayalam','Malayalam'],['bengali','Bengali'],
                ['marathi','Marathi'],['spanish','Spanish'],['french','French'],
                ['german','German'],['arabic','Arabic'],
              ].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </RowField>
          <RowField label="AI Mode">
            <select className="input" value={profile.mode}
              onChange={e => setProfile(p => ({ ...p, mode: e.target.value }))}>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="concise">Concise</option>
            </select>
          </RowField>
          {profileError && <p className="text-xs text-[var(--error)]">{profileError}</p>}
          <button onClick={saveProfile} disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving…' : profileSaved ? '✓ Saved' : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </Section>

      <Section title="Appearance">
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'system', icon: Monitor, label: 'System' },
            { value: 'dark',   icon: Moon,    label: 'Dark'   },
            { value: 'light',  icon: Sun,     label: 'Light'  },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => changeTheme(value)}
              className={`flex flex-col items-center gap-2.5 py-4 rounded-xl border-2 transition-all ${
                theme === value
                  ? 'border-[var(--border-focus)] bg-[var(--surface-raised)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--border-strong)]'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-semibold">{label}</span>
              {theme === value && <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Morning Briefing">
        <div className="space-y-2">
          <p className="text-xs text-[var(--fg-muted)] mb-3">Choose what's included in your daily briefing.</p>
          {BRIEFING_SECTIONS.map(({ key, label, icon: Icon }) => {
            const active = briefingSections.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggleBriefingSection(key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                  active
                    ? 'border-[var(--border-focus)] bg-[var(--surface-overlay)]'
                    : 'border-[var(--border)] opacity-60'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--fg)]">
                  <Icon size={14} className={active ? 'text-[var(--accent)]' : 'text-[var(--fg-dim)]'} />
                  {label}
                </span>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  active ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-strong)]'
                }`}>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      {calendars.length > 0 && (
        <Section title="Calendars">
          <div className="space-y-2">
            <p className="text-xs text-[var(--fg-muted)] mb-3">Select which Google Calendars to sync events from.</p>
            {loadingCals ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-10 rounded-xl skeleton" />)}</div>
            ) : calendars.map(cal => {
              const selected = selectedCalIds.includes(cal.id) || (selectedCalIds.length === 0 && cal.primary)
              return (
                <button
                  key={cal.id}
                  onClick={() => toggleCalendar(cal.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                    selected
                      ? 'border-[var(--border-focus)] bg-[var(--surface-overlay)]'
                      : 'border-[var(--border)] opacity-60'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-[var(--fg)] min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cal.backgroundColor || 'var(--accent)' }}
                    />
                    <span className="truncate">{cal.summary}</span>
                    {cal.primary && <span className="badge badge-muted text-[10px] shrink-0">Primary</span>}
                  </span>
                  <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    selected ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-strong)]'
                  }`}>
                    {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </button>
              )
            })}
          </div>
        </Section>
      )}

      <Section title="Integrations">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <button onClick={checkGoogleStatus} disabled={checking} className="btn-ghost text-xs text-[var(--fg-dim)] -mx-2 -my-1">
              <RefreshCw size={11} className={checking ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
          {googleConnected ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--success-subtle)] border border-[var(--success-subtle)]">
              <div className="flex items-center gap-3">
                <GoogleLogo />
                <div>
                  <p className="font-medium text-sm text-[var(--success)]">Google Connected</p>
                  <p className="text-xs text-[var(--success)] flex items-center gap-1">
                    <CheckCircle2 size={11} /> Gmail · Calendar · Contacts
                  </p>
                </div>
              </div>
              <a href={googleUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[var(--success)] hover:underline flex items-center gap-1">
                Reconnect <ExternalLink size={11} />
              </a>
            </div>
          ) : (
            <a href={googleUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-dashed border-[var(--border-strong)] hover:border-[var(--fg-dim)] transition-colors group">
              <div className="flex items-center gap-3">
                <GoogleLogo dim />
                <div>
                  <p className="font-medium text-sm text-[var(--fg)]">Connect Google Account</p>
                  <p className="text-xs text-[var(--fg-muted)]">Gmail · Calendar · Contacts</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-[var(--fg-dim)] group-hover:text-[var(--fg)] transition-colors" />
            </a>
          )}
          <p className="text-xs text-[var(--fg-dim)] px-1">After connecting, refresh to update status.</p>
        </div>
      </Section>

      <Section title="About">
        <div className="divide-y divide-[var(--border)]">
          {[
            { label: 'App Version', value: '1.0.0' },
            { label: 'Platform',   value: 'Web'    },
            { label: 'AI Model',   value: 'Claude' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-[var(--fg-muted)]">{label}</span>
              <span className="text-sm font-semibold text-[var(--fg)]">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Data & Privacy">
        <div className="space-y-2">
          <button
            onClick={exportData}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-raised)] transition-colors text-sm"
          >
            <span className="flex items-center gap-2 text-[var(--fg-muted)]"><Download size={15} /> Export my data</span>
            <ChevronRight size={14} className="text-[var(--fg-dim)]" />
          </button>
          <button
            onClick={() => setShowDeleteAccount(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--error-subtle)] transition-colors text-sm"
          >
            <span className="flex items-center gap-2 text-[var(--error)]"><Trash2 size={15} /> Delete account</span>
            <ChevronRight size={14} className="text-[var(--error)] opacity-60" />
          </button>
        </div>
      </Section>

      <button
        onClick={() => setShowLogout(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[var(--border)] text-[var(--fg-muted)] text-sm font-medium hover:border-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error-subtle)] transition-all duration-200"
      >
        <LogOut size={15} /> Sign Out
      </button>

      {showDeleteAccount && (
        <div className="overlay">
          <div className="modal max-w-xs text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--error-subtle)] flex items-center justify-center mx-auto mb-4">
              <Trash2 size={18} className="text-[var(--error)]" />
            </div>
            <h2 className="font-semibold text-sm mb-1 text-[var(--fg)]">Delete account?</h2>
            <p className="text-xs text-[var(--fg-muted)] mb-5 leading-relaxed">All your data will be permanently erased. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteAccount(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
              <button
                onClick={deleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-2 rounded-full font-semibold text-sm bg-[var(--error)] text-white hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60"
              >
                {deletingAccount ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div className="overlay">
          <div className="modal max-w-xs text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-raised)] flex items-center justify-center mx-auto mb-4">
              <LogOut size={18} className="text-[var(--fg-muted)]" />
            </div>
            <h2 className="font-semibold text-sm mb-1 text-[var(--fg)]">Sign out?</h2>
            <p className="text-xs text-[var(--fg-muted)] mb-5 leading-relaxed">You'll need to sign back in to access your account.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLogout(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-full font-semibold text-sm bg-[var(--brand-strong)] text-[var(--brand-fg)] hover:opacity-90 active:scale-[0.97] transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
