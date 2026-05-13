'use client'
import { useEffect, useState } from 'react'
import { CheckSquare, Users, Mail, Calendar, Sparkles, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import client from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--fg-dim)] tracking-wide uppercase" style={{ letterSpacing: '0.06em' }}>
          {label}
        </span>
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${accent ? 'bg-[var(--accent-subtle)]' : 'bg-[var(--surface-raised)]'}`}>
          <Icon size={14} className={accent ? 'text-[var(--accent)]' : 'text-[var(--fg-dim)]'} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-[var(--fg)]" style={{ letterSpacing: '-0.04em' }}>
          {value ?? '—'}
        </p>
        {sub && <p className="text-xs text-[var(--fg-dim)] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function OnboardingChecklist({ hasTasks, hasContacts, googleConnected }) {
  const steps = [
    { done: true,            label: 'Account created',                 link: null },
    { done: hasContacts,     label: 'Add your first contact',          link: '/contacts' },
    { done: hasTasks,        label: 'Create your first task',          link: '/tasks' },
    { done: googleConnected, label: 'Connect Google Calendar & Gmail', link: '/settings' },
  ]
  const completed = steps.filter(s => s.done).length
  const pct       = Math.round((completed / steps.length) * 100)
  if (completed === steps.length) return null

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm text-[var(--fg)]">Getting started</h2>
        <span className="text-xs text-[var(--fg-dim)]">{completed} / {steps.length}</span>
      </div>
      <div className="w-full h-1 rounded-full bg-[var(--surface-raised)] mb-4 overflow-hidden">
        <div className="h-1 rounded-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-2.5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              step.done ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-strong)]'
            }`}>
              {step.done && (
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`text-sm flex-1 ${step.done ? 'line-through text-[var(--fg-dim)]' : 'text-[var(--fg)]'}`}>
              {step.label}
            </span>
            {!step.done && step.link && (
              <Link href={step.link} className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonBlock({ h = 'h-20' }) {
  return <div className={`${h} rounded-2xl skeleton`} />
}

export default function Dashboard() {
  const { user }                        = useAuth()
  const [briefing, setBriefing]         = useState(null)
  const [loading, setLoading]           = useState(true)
  const [stats, setStats]               = useState({})
  const [todayEvents, setTodayEvents]   = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [hasTasks, setHasTasks]           = useState(false)
  const [hasContacts, setHasContacts]     = useState(false)
  const [googleConnected, setGoogleConn]  = useState(false)

  useEffect(() => {
    const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const load = async () => {
      try {
        const [brief, tasks, contacts, events, gStatus] = await Promise.allSettled([
          client.get('/briefing/today'),
          client.get('/tasks'),
          client.get('/contacts'),
          client.get('/calendar/events'),
          client.get('/auth/google/status'),
        ])
        if (brief.status === 'fulfilled') setBriefing(brief.value.data)
        if (tasks.status === 'fulfilled') {
          const all     = tasks.value.data?.tasks || []
          const pending = all.filter(t => t.status !== 'completed')
          setStats(s => ({ ...s, tasks: pending.length }))
          setHasTasks(all.length > 0)
          setOverdueTasks(all.filter(t => t.deadline && t.deadline < todayIST && t.status !== 'completed').slice(0, 3))
        }
        if (contacts.status === 'fulfilled') {
          const d     = contacts.value.data
          const total = d?.total ?? d?.all?.length ?? d?.contacts?.length ?? 0
          setStats(s => ({ ...s, contacts: total }))
          setHasContacts(total > 0)
        }
        if (gStatus.status === 'fulfilled') {
          setGoogleConn(gStatus.value.data?.connected === true)
        }
        if (events.status === 'fulfilled') {
          const all    = events.value.data?.events || []
          const todays = all.filter(e => {
            if (!e.start_time) return false
            const d   = new Date(e.start_time)
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            return key === todayIST
          })
          setTodayEvents(todays.slice(0, 4))
        }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const hour      = new Date().getHours()
  const greeting  = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="space-y-5">
      <div className="pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-sm text-[var(--fg-muted)] mt-0.5">Your daily overview</p>
      </div>

      {!loading && <OnboardingChecklist hasTasks={hasTasks} hasContacts={hasContacts} googleConnected={googleConnected} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={CheckSquare} label="Pending"  value={stats.tasks}    sub="tasks" />
        <StatCard icon={Users}       label="Contacts" value={stats.contacts} sub="total" />
        <StatCard icon={Mail}        label="Email"    value="—"              sub="Connect in Settings" />
        <StatCard icon={Calendar}    label="Today"    value={loading ? '—' : (todayEvents.length || '0')} sub="events" accent />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-[var(--fg-dim)]" />
            <h2 className="font-semibold text-sm text-[var(--fg)]">Today's Schedule</h2>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <SkeletonBlock key={i} h="h-7" />)}</div>
          ) : todayEvents.length === 0 ? (
            <p className="text-sm text-[var(--fg-dim)]">No events today — free day.</p>
          ) : (
            <div className="space-y-2.5">
              {todayEvents.map((e, i) => {
                const t = new Date(e.start_time)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--fg-dim)] w-10 shrink-0 font-mono tabular-nums">
                      {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                    <p className="text-sm text-[var(--fg)] truncate">{e.title}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="text-[var(--fg-dim)]" />
            <h2 className="font-semibold text-sm text-[var(--fg)]">Overdue</h2>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <SkeletonBlock key={i} h="h-7" />)}</div>
          ) : overdueTasks.length === 0 ? (
            <p className="text-sm text-[var(--fg-dim)]">Nothing overdue — you're on track.</p>
          ) : (
            <div className="space-y-2.5">
              {overdueTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--error)] w-10 shrink-0 font-mono tabular-nums">
                    {new Date(t.deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[var(--error)] shrink-0" />
                  <p className="text-sm text-[var(--fg)] truncate">{t.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-[var(--accent)]" />
          <h2 className="font-semibold text-sm text-[var(--fg)]">Daily Briefing</h2>
        </div>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <SkeletonBlock key={i} h="h-4" />)}</div>
        ) : briefing?.briefing?.content ? (
          <p className="text-sm text-[var(--fg)] whitespace-pre-line leading-[1.75] text-[var(--fg-muted)]">
            {briefing.briefing.content}
          </p>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-[var(--fg-muted)]">No briefing yet for today.</p>
            <p className="text-xs text-[var(--fg-dim)] mt-1">Add tasks and contacts — your briefing generates automatically each morning.</p>
          </div>
        )}
      </div>
    </div>
  )
}
