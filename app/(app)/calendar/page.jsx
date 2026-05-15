'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import client from '@/lib/api'

function EventModal({ onClose, onSave, editEvent = null }) {
  const toLocal = (iso) => iso ? new Date(new Date(iso) - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''
  const [form, setForm]       = useState({
    title:       editEvent?.title       || '',
    start_time:  toLocal(editEvent?.start_time) || '',
    end_time:    toLocal(editEvent?.end_time)   || '',
    location:    editEvent?.location    || '',
    description: editEvent?.description || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const isEdit = !!editEvent

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.end_time && form.end_time < form.start_time) return setError('End time must be after start time')
    setLoading(true)
    try {
      if (isEdit) {
        await client.put(`/calendar/events/${editEvent.id}`, form)
      } else {
        await client.post('/calendar/events', form)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} event`)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Event' : 'New Event'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={set('title')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start *</label>
              <input className="input" type="datetime-local" value={form.start_time} onChange={set('start_time')} required />
            </div>
            <div>
              <label className="label">End</label>
              <input className="input" type="datetime-local" value={form.end_time} onChange={set('end_time')} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set('location')} placeholder="Optional" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EventCard({ event, onDelete, onEdit }) {
  const start = event.start_time ? new Date(event.start_time) : null
  const end   = event.end_time   ? new Date(event.end_time)   : null

  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="w-12 shrink-0 text-center">
        <p className="text-lg font-bold text-fg">{start ? start.getDate() : '—'}</p>
        <p className="text-xs text-fg-muted uppercase">{start ? start.toLocaleString('default', { month: 'short' }) : ''}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{event.title || event.summary}</p>
        {start && (
          <p className="text-xs text-fg-muted flex items-center gap-1 mt-1">
            <Clock size={11} />
            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {end && ` – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        )}
        {event.location && (
          <p className="text-xs text-fg-muted flex items-center gap-1 mt-0.5">
            <MapPin size={11} /> {event.location}
          </p>
        )}
        {event.description && <p className="text-xs text-fg-dim mt-1 truncate">{event.description}</p>}
      </div>
      <div className="flex gap-1">
        <button onClick={() => onEdit(event)} className="p-1.5 rounded-lg hover:bg-surface-raised text-fg-dim hover:text-fg transition-colors">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(event.id)} className="p-1.5 rounded-lg hover:bg-danger-subtle text-fg-dim hover:text-danger transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function CalendarGrid({ events, selectedDate, onSelectDate }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const today    = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const firstDay   = new Date(cursor.year, cursor.month, 1)
  const lastDay    = new Date(cursor.year, cursor.month + 1, 0)
  const startPad   = firstDay.getDay()
  const totalCells = startPad + lastDay.getDate()
  const rows       = Math.ceil(totalCells / 7)

  const eventsByDate = {}
  events.forEach((e) => {
    if (!e.start_time) return
    const d   = new Date(e.start_time)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!eventsByDate[key]) eventsByDate[key] = []
    eventsByDate[key].push(e)
  })

  const prev    = () => setCursor((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })
  const next    = () => setCursor((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })
  const goToday = () => { const d = new Date(); setCursor({ year: d.getFullYear(), month: d.getMonth() }); onSelectDate(todayStr) }
  const monthLabel = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })

  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const dayNum = i - startPad + 1
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null
    const dateStr = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    return { dayNum, dateStr }
  })

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base">{monthLabel}</h2>
          <button onClick={goToday} className="text-xs px-2 py-0.5 rounded-md bg-surface-raised text-fg-muted hover:bg-surface-overlay transition-colors">Today</button>
        </div>
        <div className="flex gap-1">
          <button onClick={prev} className="p-1.5 rounded-lg hover:bg-surface-raised text-fg-muted transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={next} className="p-1.5 rounded-lg hover:bg-surface-raised text-fg-muted transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-fg-dim py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-line rounded-xl overflow-hidden border border-line">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="bg-surface min-h-[72px] p-1" />
          const { dayNum, dateStr } = cell
          const dayEvents  = eventsByDate[dateStr] || []
          const isToday    = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const isWeekend  = i % 7 === 0 || i % 7 === 6
          return (
            <div key={dateStr} onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`bg-surface min-h-[72px] p-1.5 cursor-pointer transition-colors hover:bg-surface-raised ${isSelected ? 'bg-surface-raised' : ''}`}>
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${
                isToday    ? 'bg-brand-strong text-brand-fg'
                : isSelected ? 'bg-surface-overlay text-fg'
                : isWeekend  ? 'text-fg-dim'
                : 'text-fg-muted'
              }`}>
                {dayNum}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((e, j) => (
                  <div key={j} className="truncate text-[10px] leading-tight bg-accent-subtle text-accent rounded px-1 py-0.5">
                    {e.title || e.summary}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-fg-dim px-1">+{dayEvents.length - 2} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [events, setEvents]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(false)
  const [editEvent, setEditEvent]       = useState(null)
  const [needsConnect, setNeedsConnect] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/calendar/events')
      const seen = new Set()
      const deduped = (data.events || []).filter((e) => {
        if (!e.id || seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })
      setEvents(deduped)
      setNeedsConnect(false)
    } catch (err) {
      if (err.response?.status === 403) setNeedsConnect(true)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => { window.removeEventListener('focus', onFocus); clearInterval(interval) }
  }, [])

  const del = async (id) => {
    if (!confirm('Delete this event?')) return
    await client.delete(`/calendar/events/${id}`)
    load()
  }

  const token      = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const connectUrl = `https://pers-ruxy.onrender.com/auth/google?token=${token}`

  if (needsConnect) return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      <div className="card p-8 text-center">
        <Calendar size={48} className="mx-auto mb-4 text-fg-dim opacity-70" />
        <h2 className="text-lg font-semibold mb-2">Connect Google Calendar</h2>
        <p className="text-sm text-fg-muted mb-6">Connect your Google account to sync your calendar and create events.</p>
        <a href={connectUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
          Connect Google Account
        </a>
        <button onClick={load} className="block mx-auto mt-3 text-sm text-fg-muted hover:underline">I already connected, refresh</button>
      </div>
    </div>
  )

  const sorted     = [...events].sort((a, b) => new Date(a.start_time || 0) - new Date(b.start_time || 0))
  const listEvents = selectedDate
    ? sorted.filter((e) => {
        if (!e.start_time) return false
        const d   = new Date(e.start_time)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        return key === selectedDate
      })
    : sorted
  const listLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    : `${events.length} upcoming events`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-fg-muted">{listLabel}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Event</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-80 bg-surface-raised rounded-xl animate-pulse" />
          {[1,2,3].map((i) => <div key={i} className="h-20 bg-surface-raised rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <CalendarGrid events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          {selectedDate && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-medium text-fg-muted">{listLabel}</p>
              <button onClick={() => setSelectedDate(null)} className="text-xs text-fg-dim hover:text-fg-muted transition-colors">Show all</button>
            </div>
          )}
          {listEvents.length === 0 ? (
            <div className="text-center py-10 text-fg-dim">
              <Calendar size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{selectedDate ? 'No events on this day' : 'No upcoming events'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {listEvents.map((e, i) => (
                <EventCard key={e.id || i} event={e} onDelete={del} onEdit={(ev) => setEditEvent(ev)} />
              ))}
            </div>
          )}
        </>
      )}

      {modal && <EventModal onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}
      {editEvent && (
        <EventModal
          editEvent={editEvent}
          onClose={() => setEditEvent(null)}
          onSave={() => { setEditEvent(null); load() }}
        />
      )}
    </div>
  )
}
