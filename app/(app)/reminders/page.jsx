'use client'
import { useEffect, useRef, useState } from 'react'
import { Bell, Plus, Trash2, CheckCircle2, Circle, Clock, BellOff, Pencil } from 'lucide-react'
import client from '@/lib/api'

function ReminderModal({ reminder, onClose, onSave }) {
  const isEdit = !!reminder?.id
  const [form, setForm] = useState({
    title:    reminder?.title    || '',
    deadline: reminder?.deadline ? reminder.deadline.slice(0, 10) : new Date().toISOString().slice(0, 10),
    time:     reminder?.notes?.match(/\[TIME:([\d:]+)\]/)?.[1] || '',
    priority: reminder?.priority || 'medium',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const submittingRef         = useRef(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setError('')
    setLoading(true)
    try {
      const notes   = form.time ? `[TIME:${form.time}]` : null
      const payload = { title: form.title, deadline: form.deadline, priority: form.priority, notes }
      if (isEdit) await client.put(`/tasks/${reminder.id}`, payload)
      else        await client.post('/tasks', payload)
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save reminder')
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <div className="overlay">
      <div className="modal w-full max-w-md">
        <h2 className="text-base font-semibold mb-5 text-[var(--fg)] tracking-tight">
          {isEdit ? 'Edit Reminder' : 'New Reminder'}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-xs text-[var(--error)] bg-[var(--error-subtle)] px-3 py-2 rounded-xl">{error}</p>}
          <div>
            <label className="label">Reminder</label>
            <input className="input" placeholder="e.g. Call dentist" value={form.title} onChange={set('title')} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.deadline} onChange={set('deadline')} required />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" value={form.time} onChange={set('time')} />
            </div>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal max-w-xs text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--error-subtle)] flex items-center justify-center mx-auto mb-4">
          <Trash2 size={16} className="text-[var(--error)]" />
        </div>
        <p className="text-sm text-[var(--fg)] mb-5 leading-relaxed">Delete this reminder?</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-full font-semibold text-sm bg-[var(--error)] text-white hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function ReminderCard({ reminder, onToggle, onEdit, onDelete }) {
  const time      = reminder.notes?.match(/\[TIME:([\d:]+)\]/)?.[1]
  const deadline  = reminder.deadline
  const today     = new Date().toISOString().slice(0, 10)
  const isToday   = deadline === today
  const isOverdue = deadline && deadline < today && reminder.status !== 'completed'
  const isDone    = reminder.status === 'completed'

  const dateLabel = isToday   ? 'Today'
    : isOverdue ? new Date(deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : deadline  ? new Date(deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : ''

  return (
    <div className={`card p-4 flex items-center gap-3 transition-all duration-200 ${isDone ? 'opacity-50' : 'card-hover'}`}>
      <button
        onClick={() => onToggle(reminder)}
        className={`shrink-0 transition-colors ${isDone ? 'text-[var(--fg-dim)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
      >
        {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDone ? 'line-through text-[var(--fg-dim)]' : 'text-[var(--fg)]'}`}>
          {reminder.title}
        </p>
        {(deadline || time) && (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={11} className={isOverdue ? 'text-[var(--error)]' : 'text-[var(--fg-dim)]'} />
            <span className={`text-xs ${
              isOverdue ? 'text-[var(--error)] font-medium'
              : isToday  ? 'text-[var(--fg)] font-semibold'
              : 'text-[var(--fg-dim)]'
            }`}>
              {dateLabel}{time ? ` · ${time}` : ''}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-0.5 shrink-0">
        {!isDone && (
          <button onClick={() => onEdit(reminder)} className="p-1.5 rounded-lg text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-all">
            <Pencil size={14} />
          </button>
        )}
        <button onClick={() => onDelete(reminder.id)} className="p-1.5 rounded-lg text-[var(--fg-dim)] hover:text-[var(--error)] hover:bg-[var(--error-subtle)] transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Reminders() {
  const [reminders, setReminders]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(null)
  const [filter, setFilter]           = useState('upcoming')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    try {
      const { data } = await client.get('/tasks')
      setReminders(data.tasks || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggle = async (r) => {
    const newStatus = r.status === 'completed' ? 'pending' : 'completed'
    await client.put(`/tasks/${r.id}`, { ...r, status: newStatus })
    load()
  }

  const del = async () => {
    await client.delete(`/tasks/${deleteTarget}`)
    load()
    setDeleteTarget(null)
  }

  const today   = new Date().toISOString().slice(0, 10)
  const filtered = reminders.filter(r => {
    if (filter === 'upcoming') return r.status !== 'completed' && (!r.deadline || r.deadline >= today)
    if (filter === 'today')    return r.deadline === today && r.status !== 'completed'
    if (filter === 'overdue')  return r.deadline && r.deadline < today && r.status !== 'completed'
    if (filter === 'done')     return r.status === 'completed'
    return true
  }).sort((a, b) => {
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return a.deadline.localeCompare(b.deadline)
  })

  const todayCount   = reminders.filter(r => r.deadline === today && r.status !== 'completed').length
  const overdueCount = reminders.filter(r => r.deadline && r.deadline < today && r.status !== 'completed').length

  const FILTERS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'today',    label: todayCount   ? `Today (${todayCount})`   : 'Today'   },
    { key: 'overdue',  label: overdueCount ? `Overdue (${overdueCount})` : 'Overdue' },
    { key: 'done',     label: 'Done' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Reminders</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            {todayCount > 0 && <span className="font-semibold text-[var(--fg)]">{todayCount} today</span>}
            {todayCount > 0 && overdueCount > 0 && ' · '}
            {overdueCount > 0 && <span className="text-[var(--error)]">{overdueCount} overdue</span>}
            {todayCount === 0 && overdueCount === 0 && 'All clear'}
          </p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> New
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              filter === key
                ? 'bg-[var(--brand-strong)] text-[var(--brand-fg)]'
                : 'bg-[var(--surface-raised)] text-[var(--fg-muted)] border border-[var(--border)] hover:bg-[var(--surface-overlay)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2.5">
          {[1,2,3].map(i => <div key={i} className="h-[60px] rounded-2xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BellOff size={36} className="mx-auto mb-3 text-[var(--fg-dim)] opacity-25" />
          <p className="font-medium text-sm text-[var(--fg)]">No reminders here</p>
          <p className="text-xs text-[var(--fg-dim)] mt-1">You can also set reminders via Chat</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onToggle={toggle}
              onEdit={r => setModal(r)}
              onDelete={id => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <ReminderModal reminder={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
      {deleteTarget && (
        <ConfirmDialog onConfirm={del} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
