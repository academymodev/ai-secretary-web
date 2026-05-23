'use client'
import { useEffect, useState } from 'react'
import { BarChart2, CheckCircle2, Mail, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import client from '@/lib/api'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

marked.setOptions({ breaks: true, gfm: true })

function renderMarkdown(text) {
  const raw  = marked.parse(text || '')
  const safe = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['p','br','strong','em','ul','ol','li','h1','h2','h3','h4','table','thead','tbody','tr','th','td','span','div'],
    ALLOWED_ATTR: [],
  })
  return <div className="prose-chat text-sm" dangerouslySetInnerHTML={{ __html: safe }} />
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4 flex flex-col items-center gap-2 text-center">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-[var(--fg)]">{value ?? '—'}</p>
      <p className="text-xs text-[var(--fg-muted)]">{label}</p>
    </div>
  )
}

function HistoryItem({ report }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-raised)] transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-medium text-[var(--fg)]">
            Week of {new Date(report.week_start + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {report.stats && (
            <p className="text-xs text-[var(--fg-muted)] mt-0.5">
              {report.stats.tasks_completed ?? 0} tasks · {report.stats.emails_sent ?? 0} emails · {report.stats.meetings_attended ?? 0} meetings
            </p>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-[var(--fg-dim)]" /> : <ChevronDown size={14} className="text-[var(--fg-dim)]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
          {renderMarkdown(report.content)}
        </div>
      )}
    </div>
  )
}

export default function Reports() {
  const [report, setReport]     = useState(null)
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [histLoading, setHistLoading] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    client.get('/reports/weekly')
      .then(({ data }) => setReport(data.report || null))
      .catch(() => setError('No report available yet for this week.'))
      .finally(() => setLoading(false))

    client.get('/reports/weekly/history')
      .then(({ data }) => setHistory(data.reports || []))
      .catch(() => {})
      .finally(() => setHistLoading(false))
  }, [])

  const stats = report?.stats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Weekly Report</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-0.5">
          {report ? `Week of ${new Date(report.week_start + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Your productivity overview'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
          </div>
          <div className="h-64 rounded-2xl skeleton" />
        </div>
      ) : error && !report ? (
        <div className="card p-10 text-center">
          <BarChart2 size={40} className="mx-auto mb-4 text-[var(--fg-dim)] opacity-30" />
          <p className="font-medium text-sm text-[var(--fg)]">No report yet</p>
          <p className="text-xs text-[var(--fg-muted)] mt-1">{error}</p>
          <p className="text-xs text-[var(--fg-dim)] mt-3">Reports are generated every Monday morning.</p>
        </div>
      ) : report ? (
        <>
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={CheckCircle2} label="Tasks done"   value={stats.tasks_completed}   color="bg-green-500" />
              <StatCard icon={Mail}         label="Emails sent"  value={stats.emails_sent}        color="bg-blue-500"  />
              <StatCard icon={Calendar}     label="Meetings"     value={stats.meetings_attended}  color="bg-purple-500" />
              <StatCard icon={TrendingUp}   label="Score"        value={stats.productivity_score ? `${stats.productivity_score}%` : null} color="bg-orange-500" />
            </div>
          )}

          <div className="card p-5">
            <p className="section-label mb-3">Summary</p>
            {renderMarkdown(report.content)}
          </div>
        </>
      ) : null}

      {/* History */}
      <div>
        <p className="section-label mb-3">Past Reports</p>
        {histLoading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 rounded-2xl skeleton" />)}</div>
        ) : history.length === 0 ? (
          <p className="text-sm text-[var(--fg-dim)] text-center py-6">No past reports yet.</p>
        ) : (
          <div className="space-y-2">
            {history.filter(r => r.id !== report?.id).map((r, i) => (
              <HistoryItem key={r.id || i} report={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
