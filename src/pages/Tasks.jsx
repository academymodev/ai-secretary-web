import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Pencil, CheckCircle2, Circle, AlertCircle, Loader2, Search } from 'lucide-react'
import client from '../api/client'

const PRIORITIES = ['low', 'medium', 'high']

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-sm p-6">
        <p className="text-sm text-fg mb-5">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center px-5 py-2.5 rounded-full font-semibold text-sm bg-danger text-white hover:opacity-90 active:scale-[0.97] transition-all"
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
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const submittingRef         = useRef(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={set('title')} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskCard({ task, onToggle, onEdit, onDelete, isToggling }) {
  const priorityColor = {
    low:    'bg-surface-raised text-fg-muted',
    medium: 'bg-caution-subtle text-caution font-medium',
    high:   'bg-danger-subtle text-danger font-semibold',
  }
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed'

  return (
    <div className={`card p-4 flex items-start gap-3 ${task.status === 'completed' ? 'opacity-80' : ''}`}>
      <button
        onClick={() => !isToggling && onToggle(task)}
        disabled={isToggling}
        aria-label={task.status === 'completed' ? 'Mark as pending' : 'Mark as complete'}
        className="mt-0.5 shrink-0 text-fg-dim hover:text-fg transition-colors disabled:cursor-wait"
      >
        {isToggling
          ? <Loader2 size={20} className="animate-spin" />
          : task.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-fg-dim' : 'text-fg'}`}>{task.title}</p>
        {task.notes && <p className="text-xs text-fg-muted mt-0.5 truncate">{task.notes}</p>}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority] || priorityColor.medium}`}>{task.priority}</span>
          {task.deadline && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-danger' : 'text-fg-dim'}`}>
              {isOverdue && <AlertCircle size={12} />}
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        {task.status !== 'completed' && (
          <button onClick={() => onEdit(task)} aria-label="Edit task" className="p-1.5 rounded-lg hover:bg-surface-raised text-fg-dim transition-colors">
            <Pencil size={15} />
          </button>
        )}
        <button onClick={onDelete} aria-label="Delete task" className="p-1.5 rounded-lg hover:bg-danger-subtle text-fg-dim hover:text-danger transition-colors">
          <Trash2 size={15} />
        </button>
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
    } catch {
      // leave task in original state on failure
    } finally {
      setToggling(prev => { const s = new Set(prev); s.delete(task.id); return s })
    }
  }

  const del = async () => {
    try { await client.delete(`/tasks/${deleteTarget}`); load() }
    finally { setDeleteTarget(null) }
  }

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)
    if (filter === 'pending')   return t.status !== 'completed' && matchesSearch
    if (filter === 'completed') return t.status === 'completed' && matchesSearch
    return matchesSearch
  })

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-fg-muted">{tasks.filter((t) => t.status !== 'completed').length} pending</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim pointer-events-none" />
        <input
          className="input pl-9"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-150 ${
              filter === f
                ? 'bg-brand-strong text-brand-fg shadow-sm'
                : 'bg-surface text-fg-muted border border-line hover:bg-surface-raised'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loadError && (
        <p className="text-sm text-danger bg-danger-subtle px-4 py-3 rounded-xl">{loadError}</p>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-surface-raised rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-fg-dim opacity-30" />
          <p className="font-medium text-fg">
            {filter === 'completed' ? 'No completed tasks yet'
             : filter === 'pending' ? "You're all caught up!"
             : 'No tasks yet'}
          </p>
          <p className="text-xs text-fg-dim mt-1">
            {filter === 'completed' ? 'Completed tasks will appear here'
             : filter === 'pending' ? 'All your tasks are done'
             : 'Tap "New Task" to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onToggle={toggle}
              onEdit={(t) => setModal(t)}
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
          message="Delete this task? This cannot be undone."
          onConfirm={del}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
