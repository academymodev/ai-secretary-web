'use client'
import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Pencil, CheckCircle2, Circle, AlertCircle, Loader2, Search, ListChecks } from 'lucide-react'
import client from '@/lib/api'

const PRIORITIES = ['low', 'medium', 'high']

const PRIORITY_META = {
  high:   { label: 'High',   dot: 'bg-[var(--error)]',   text: 'text-[var(--error)]' },
  medium: { label: 'Medium', dot: 'bg-[var(--warning)]', text: 'text-[var(--warning)]' },
  low:    { label: 'Low',    dot: 'bg-[var(--fg-dim)]',  text: 'text-[var(--fg-dim)]' },
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal max-w-xs text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--error-subtle)] flex items-center justify-center mx-auto mb-4">
          <Trash2 size={18} className="text-[var(--error)]" />
        </div>
        <p className="text-sm text-[var(--fg)] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center py-2 rounded-full font-semibold text-sm
                       bg-[var(--error)] text-white transition-all active:scale-[0.97] hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function TaskModal({ task, onClose, onSave }) {
  const isEdit = !!task?.id
  const [form, setForm] = useState({
    title:    task?.title    || '',
    notes:    task?.notes    || '',
    priority: task?.priority || 'medium',
    deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
  })
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const submittingRef          = useRef(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, deadline: form.deadline || null }
      if (isEdit) await client.put(`/tasks/${task.id}`, payload)
      else        await client.post('/tasks', payload)
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save task')
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <div className="overlay">
      <div className="modal w-full max-w-md">
        <h2 className="text-base font-semibold mb-5 text-[var(--fg)] tracking-tight">
          {isEdit ? 'Edit Task' : 'New Task'}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <p className="text-xs text-[var(--error)] bg-[var(--error-subtle)] px-3 py-2 rounded-xl">{error}</p>
          )}
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={set('title')} placeholder="Task title" required autoFocus />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Optional notes…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
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

function TaskCard({ task, onToggle, onEdit, onDelete, isToggling }) {
  const p         = PRIORITY_META[task.priority] || PRIORITY_META.medium
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed'
  const isDone    = task.status === 'completed'

  return (
    <div className={`card flex items-start gap-0 overflow-hidden transition-all duration-200 ${isDone ? 'opacity-55' : 'card-hover'}`}>
      {/* Priority strip */}
      <div className={`w-0.5 self-stretch shrink-0 ${isDone ? 'bg-[var(--border)]' : p.dot}`} />

      <div className="flex items-start gap-3 flex-1 p-4 min-w-0">
        {/* Toggle */}
        <button
          onClick={() => !isToggling && onToggle(task)}
          disabled={isToggling}
          aria-label={isDone ? 'Mark as pending' : 'Mark as complete'}
          className={`mt-0.5 shrink-0 transition-colors ${isDone ? 'text-[var(--fg-dim)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
        >
          {isToggling
            ? <Loader2 size={18} className="animate-spin text-[var(--fg-dim)]" />
            : isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-[var(--fg-dim)]' : 'text-[var(--fg)]'}`}>
            {task.title}
          </p>
          {task.notes && (
            <p className="text-xs text-[var(--fg-dim)] mt-0.5 truncate">{task.notes}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-[11px] font-medium ${p.text}`}>{p.label}</span>
            {task.deadline && (
              <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-[var(--error)]' : 'text-[var(--fg-dim)]'}`}>
                {isOverdue && <AlertCircle size={11} />}
                {new Date(task.deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-0.5 shrink-0 ml-1">
          {!isDone && (
            <button
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              className="p-1.5 rounded-lg text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--surface-raised)] transition-all"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={onDelete}
            aria-label="Delete task"
            className="p-1.5 rounded-lg text-[var(--fg-dim)] hover:text-[var(--error)] hover:bg-[var(--error-subtle)] transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [loadError, setLoadError]       = useState('')
  const [modal, setModal]               = useState(null)
  const [filter, setFilter]             = useState('all')
  const [toggling, setToggling]         = useState(new Set())
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch]             = useState('')

  const load = async () => {
    setLoadError('')
    try {
      const { data } = await client.get('/tasks')
      setTasks(data.tasks || [])
    } catch (err) {
      setLoadError(err.response?.data?.message || err.response?.data?.error || 'Failed to load tasks')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggle = async (task) => {
    if (toggling.has(task.id)) return
    setToggling(prev => new Set([...prev, task.id]))
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await client.put(`/tasks/${task.id}`, { ...task, status: newStatus })
      load()
    } catch { /* leave in original state */ }
    finally {
      setToggling(prev => { const s = new Set(prev); s.delete(task.id); return s })
    }
  }

  const del = async () => {
    try { await client.delete(`/tasks/${deleteTarget}`); load() }
    finally { setDeleteTarget(null) }
  }

  const completeAllVisible = async () => {
    const ids = filtered.filter(t => t.status !== 'completed').map(t => t.id)
    if (!ids.length) return
    await client.post('/tasks/bulk/complete', { ids }).catch(() => {})
    load()
  }

  const deleteAllCompleted = async () => {
    if (!confirm('Delete all completed tasks?')) return
    await client.delete('/tasks/bulk/completed').catch(() => {})
    load()
  }

  const filtered = tasks.filter(t => {
    const q            = search.toLowerCase()
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)
    if (filter === 'pending')   return t.status !== 'completed' && matchesSearch
    if (filter === 'completed') return t.status === 'completed' && matchesSearch
    return matchesSearch
  })

  const pendingCount = tasks.filter(t => t.status !== 'completed').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Tasks</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            {pendingCount > 0 ? `${pendingCount} pending` : 'All done'}
          </p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> New Task
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-dim)] pointer-events-none" />
        <input
          className="input pl-9"
          placeholder="Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters + bulk actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['all', 'pending', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-150 ${
              filter === f
                ? 'bg-[var(--brand-strong)] text-[var(--brand-fg)]'
                : 'bg-[var(--surface-raised)] text-[var(--fg-muted)] border border-[var(--border)] hover:bg-[var(--surface-overlay)]'
            }`}
          >
            {f}
          </button>
        ))}
        {filtered.some(t => t.status !== 'completed') && (
          <button
            onClick={completeAllVisible}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--surface-raised)] text-[var(--fg-muted)] border border-[var(--border)] hover:bg-[var(--surface-overlay)] transition-all"
          >
            <ListChecks size={12} /> Complete all
          </button>
        )}
        {tasks.some(t => t.status === 'completed') && (
          <button
            onClick={deleteAllCompleted}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--error)] bg-[var(--error-subtle)] hover:opacity-80 transition-all"
          >
            <Trash2 size={12} /> Clear done
          </button>
        )}
      </div>

      {/* Error */}
      {loadError && (
        <p className="text-sm text-[var(--error)] bg-[var(--error-subtle)] px-4 py-3 rounded-xl">{loadError}</p>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2.5">
          {[1,2,3].map(i => <div key={i} className="h-[72px] rounded-2xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 size={36} className="mx-auto mb-3 text-[var(--fg-dim)] opacity-25" />
          <p className="font-medium text-sm text-[var(--fg)]">
            {filter === 'completed' ? 'No completed tasks'
             : filter === 'pending' ? "You're all caught up"
             : search ? 'No matching tasks'
             : 'No tasks yet'}
          </p>
          <p className="text-xs text-[var(--fg-dim)] mt-1">
            {filter === 'completed' ? 'Completed tasks appear here'
             : filter === 'pending' ? 'Everything is done!'
             : 'Tap "New Task" to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              onToggle={toggle}
              onEdit={t => setModal(t)}
              onDelete={() => setDeleteTarget(t.id)}
              isToggling={toggling.has(t.id)}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <TaskModal task={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message="This task will be permanently deleted."
          onConfirm={del}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
