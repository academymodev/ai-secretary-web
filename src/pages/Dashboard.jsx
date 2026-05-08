import { useEffect, useState } from 'react'
import { CheckSquare, Users, Mail, Calendar, Sparkles, AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-fg-dim tracking-tight">{label}</p>
        <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center">
          <Icon size={15} className="text-fg-muted" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value ?? '—'}</p>
      {value === null && hint && <p className="text-xs text-fg-dim mt-1">{hint}</p>}
    </div>
  )
}

function OnboardingChecklist({ hasTasks, hasContacts }) {
  const steps = [
    { done: true,        label: 'Account created',                 link: null },
    { done: hasContacts, label: 'Add your first contact',          link: '/contacts' },
    { done: hasTasks,    label: 'Create your first task',          link: '/tasks' },
    { done: false,       label: 'Connect Google Calendar & Gmail', link: '/settings' },
  ]
  const completed = steps.filter(s => s.done).length
  const pct = Math.round((completed / steps.length) * 100)
  if (completed === steps.length) return null

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">Getting started</h2>
        <span className="text-xs text-fg-dim">{completed}/{steps.length} done</span>
      </div>
      <div className="w-full h-1.5 bg-surface-raised rounded-full mb-4">
        <div className="h-1.5 bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              step.done ? 'bg-accent border-accent' : 'border-line-strong'
            }`}>
              {step.done && (
                <svg className="w-2.5 h-2.5 text-accent-fg" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`text-sm flex-1 ${step.done ? 'line-through text-fg-dim' : 'text-fg'}`}>{step.label}</span>
            {!step.done && step.link && (
              <Link to={step.link} className="text-accent hover:text-accent-hover transition-colors">
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [briefing, setBriefing]         = useState(null)
  const [loading, setLoading]           = useState(true)
  const [stats, setStats]               = useState({})
  const [todayEvents, setTodayEvents]   = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [hasTasks, setHasTasks]         = useState(false)
  const [hasContacts, setHasContacts]   = useState(false)

  useEffect(() => {
    const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const load = async () => {
      try {
        const [brief, tasks, contacts, events] = await Promise.allSettled([
          client.get('/briefing/today'),
          client.get('/tasks'),
          client.get('/contacts'),
          client.get('/calendar/events'),
        ])
        if (brief.status === 'fulfilled') setBriefing(brief.value.data)
        if (tasks.status === 'fulfilled') {
          const all = tasks.value.data?.tasks || []
          const pending = all.filter(t => t.status !== 'completed')
          setStats((s) => ({ ...s, tasks: pending.length }))
          setHasTasks(all.length > 0)
          setOverdueTasks(all.filter(t => t.deadline && t.deadline < todayIST && t.status !== 'completed').slice(0, 3))
        }
        if (contacts.status === 'fulfilled') {
          const all = contacts.value.data?.all || contacts.value.data?.contacts || []
          setStats((s) => ({ ...s, contacts: all.length }))
          setHasContacts(all.length > 0)
        }
        if (events.status === 'fulfilled') {
          const all = events.value.data?.events || []
          const todays = all.filter(e => {
            if (!e.start_time) return false
            const d = new Date(e.start_time)
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            return key === todayIST
          })
          setTodayEvents(todays.slice(0, 4))
        }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{greeting}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-fg-muted text-sm mt-1">Here's your daily overview</p>
      </div>

      {!loading && <OnboardingChecklist hasTasks={hasTasks} hasContacts={hasContacts} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Pending Tasks" value={stats.tasks} />
        <StatCard icon={Users}       label="Contacts"      value={stats.contacts} />
        <StatCard icon={Mail}        label="Email"         value={null} hint="Connect in Settings" />
        <StatCard icon={Calendar}    label="Today"         value={todayEvents.length || 'Free'} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-fg-muted" />
            <h2 className="font-semibold text-sm">Today's Schedule</h2>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-8 bg-surface-raised rounded animate-pulse" />)}</div>
          ) : todayEvents.length === 0 ? (
            <p className="text-sm text-fg-muted">No events today — enjoy the free day.</p>
          ) : (
            <div className="space-y-2">
              {todayEvents.map((e, i) => {
                const t = new Date(e.start_time)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs text-fg-dim w-12 shrink-0 font-mono">
                      {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-fg-dim shrink-0" />
                    <p className="text-sm truncate">{e.title}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-fg-muted" />
            <h2 className="font-semibold text-sm">Overdue Tasks</h2>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-8 bg-surface-raised rounded animate-pulse" />)}</div>
          ) : overdueTasks.length === 0 ? (
            <p className="text-sm text-fg-muted">No overdue tasks. You're on track!</p>
          ) : (
            <div className="space-y-2">
              {overdueTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-fg-dim w-12 shrink-0 font-mono">
                    {new Date(t.deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-fg-dim shrink-0" />
                  <p className="text-sm truncate">{t.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-accent" />
          <h2 className="font-semibold">Daily Briefing</h2>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-4 bg-surface-raised rounded animate-pulse" />)}
          </div>
        ) : briefing?.briefing?.content ? (
          <p className="text-sm text-fg whitespace-pre-line leading-relaxed">{briefing.briefing.content}</p>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-fg-muted mb-2">No briefing yet for today.</p>
            <p className="text-xs text-fg-dim">Add tasks and contacts — your briefing generates automatically each morning.</p>
          </div>
        )}
      </div>
    </div>
  )
}
