'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, Trash2, Pencil, User, Mail, Phone, Building2, FileText, Star, X, Plus, Clock, PhoneCall, Video, MessageSquare, CalendarCheck, Cake } from 'lucide-react'
import client from '@/lib/api'

const Portal = ({ children }) =>
  typeof document !== 'undefined' ? createPortal(children, document.body) : null

const initial = (name) => (name?.match(/[a-zA-Z0-9]/)?.[0] ?? name?.[0] ?? '?').toUpperCase()

const whatsappUrl = (phone) => {
  const digits = phone.replace(/\D/g, '')
  const num = digits.startsWith('91') && digits.length === 12 ? digits : digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${num}`
}

function ContactModal({ contact, onClose, onSave }) {
  const isEdit = !!contact?.id
  const [form, setForm] = useState({
    name:     contact?.name     || '',
    email:    contact?.email    || '',
    phone:    contact?.phone    || '',
    company:  contact?.company  || '',
    notes:    contact?.notes    || '',
    is_vip:   contact?.is_vip   || false,
    tags:     contact?.tags     || '',
    birthday: contact?.birthday || '',
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
      if (isEdit) await client.put(`/contacts/${contact.id}`, form)
      else        await client.post('/contacts', form)
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact')
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <Portal>
      <div className="overlay">
        <div className="modal w-full max-w-md">
        <h2 className="text-base font-semibold mb-5 text-[var(--fg)] tracking-tight">
          {isEdit ? 'Edit Contact' : 'New Contact'}
        </h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-xs text-[var(--error)] bg-[var(--error-subtle)] px-3 py-2 rounded-xl">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="Full name" required autoFocus />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" />
            </div>
            <div className="col-span-2">
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={set('company')} placeholder="Company name" />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Optional notes…" />
            </div>
            <div>
              <label className="label">Tags</label>
              <input className="input" value={form.tags} onChange={set('tags')} placeholder="work, friend…" />
            </div>
            <div>
              <label className="label">Birthday</label>
              <input className="input" type="date" value={form.birthday} onChange={set('birthday')} />
            </div>
            <div className="col-span-2 flex items-center gap-2.5">
              <input id="vip" type="checkbox" checked={form.is_vip}
                onChange={e => setForm(f => ({ ...f, is_vip: e.target.checked }))}
                className="w-4 h-4 rounded accent-[var(--brand-strong)]" />
              <label htmlFor="vip" className="text-sm font-medium text-[var(--fg)] flex items-center gap-1.5">
                <Star size={13} className="text-[var(--fg-dim)]" /> Mark as VIP
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
        </div>
      </div>
    </Portal>
  )
}

const INTERACTION_TYPES = [
  { value: 'call',    label: 'Call',    Icon: PhoneCall     },
  { value: 'meeting', label: 'Meeting', Icon: CalendarCheck },
  { value: 'video',   label: 'Video',   Icon: Video         },
  { value: 'message', label: 'Message', Icon: MessageSquare },
]

function parseInteractions(notes) {
  if (!notes) return { cleanNotes: '', interactions: [] }
  const interactions = []
  const logRe = /\[I:(\d{4}-\d{2}-\d{2})\|([^\]]+)\]([^\[]*)/g
  let m
  while ((m = logRe.exec(notes)) !== null) {
    interactions.push({ date: m[1], type: m[2], note: m[3].trim() })
  }
  const cleanNotes = notes.replace(/\[I:[^\]]+\][^\[]*/g, '').trim()
  return { cleanNotes, interactions: interactions.reverse() }
}

function ContactDetail({ contact, onClose, onEdit, onDelete, onInteractionLogged }) {
  const { cleanNotes, interactions } = parseInteractions(contact.notes)
  const [logOpen, setLogOpen]   = useState(false)
  const [logForm, setLogForm]   = useState({ type: 'call', notes: '', date: new Date().toISOString().slice(0, 10) })
  const [logging, setLogging]   = useState(false)

  const submitLog = async (e) => {
    e.preventDefault()
    setLogging(true)
    try {
      await client.post(`/contacts/${contact.id}/interactions`, logForm)
      setLogOpen(false)
      setLogForm({ type: 'call', notes: '', date: new Date().toISOString().slice(0, 10) })
      onInteractionLogged()
    } catch {} finally { setLogging(false) }
  }

  const typeMap = Object.fromEntries(INTERACTION_TYPES.map(t => [t.value, t]))

  return (
    <Portal>
      <div className="overlay items-end sm:items-center">
      <div className="modal w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-strong)] text-[var(--brand-fg)] flex items-center justify-center text-lg font-bold shrink-0">
              {initial(contact.name)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-[var(--fg)] tracking-tight">{contact.name}</h2>
                {contact.is_vip && <Star size={13} className="text-[var(--fg-muted)] fill-current" />}
              </div>
              {contact.company && <p className="text-sm text-[var(--fg-muted)]">{contact.company}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[var(--surface-raised)] text-[var(--fg-dim)] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-overlay)] transition-colors group">
              <Mail size={15} className="text-[var(--fg-dim)] shrink-0" />
              <span className="text-sm text-[var(--fg)] group-hover:underline">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <div className="flex gap-2">
              <a href={`tel:${contact.phone}`} className="flex flex-1 items-center gap-3 p-3 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-overlay)] transition-colors group">
                <Phone size={15} className="text-[var(--fg-dim)] shrink-0" />
                <span className="text-sm text-[var(--fg)] group-hover:underline">{contact.phone}</span>
              </a>
              <a href={whatsappUrl(contact.phone)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-raised)] hover:bg-[#25d36620] text-[var(--fg-dim)] hover:text-[#25d366] transition-all text-xs font-semibold shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.554 4.112 1.528 5.837L0 24l6.335-1.507A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.368l-.36-.213-3.728.887.937-3.618-.234-.373A9.818 9.818 0 1112 21.818z"/></svg>
                WhatsApp
              </a>
            </div>
          )}
          {contact.company && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-raised)]">
              <Building2 size={15} className="text-[var(--fg-dim)] shrink-0" />
              <span className="text-sm text-[var(--fg)]">{contact.company}</span>
            </div>
          )}
          {contact.birthday && (() => {
            const today = new Date()
            const bd = new Date(contact.birthday + 'T00:00:00')
            const isToday = bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate()
            const label = bd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
            const year  = contact.birthday.slice(0, 4)
            const age   = year && year !== '0000' ? ` · ${today.getFullYear() - parseInt(year)} yrs` : ''
            return (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${isToday ? 'bg-pink-500/10' : 'bg-[var(--surface-raised)]'}`}>
                <Cake size={15} className={isToday ? 'text-pink-500 shrink-0' : 'text-[var(--fg-dim)] shrink-0'} />
                <span className={`text-sm ${isToday ? 'text-pink-500 font-semibold' : 'text-[var(--fg)]'}`}>
                  {label}{age}{isToday ? ' 🎂 Today!' : ''}
                </span>
              </div>
            )
          })()}
          {contact.tags && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {contact.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-overlay)] text-[var(--fg-muted)] border border-[var(--border)]">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {cleanNotes && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-raised)]">
              <FileText size={15} className="text-[var(--fg-dim)] shrink-0 mt-0.5" />
              <span className="text-sm text-[var(--fg)] whitespace-pre-line">{cleanNotes}</span>
            </div>
          )}
        </div>

        {/* Interaction log */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-[var(--fg-dim)] uppercase tracking-wider">Interactions</p>
            <button
              onClick={() => setLogOpen(o => !o)}
              className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <Plus size={11} /> Log
            </button>
          </div>

          {logOpen && (
            <form onSubmit={submitLog} className="mb-3 p-3 rounded-xl bg-[var(--surface-raised)] space-y-2.5">
              <div className="flex gap-2">
                {INTERACTION_TYPES.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLogForm(f => ({ ...f, type: value }))}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-semibold transition-all border ${
                      logForm.type === value
                        ? 'border-[var(--border-focus)] bg-[var(--surface-overlay)] text-[var(--fg)]'
                        : 'border-[var(--border)] text-[var(--fg-dim)]'
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-[10px]">Date</label>
                  <input className="input text-xs py-1.5" type="date" value={logForm.date}
                    onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-[10px]">Notes</label>
                  <input className="input text-xs py-1.5" placeholder="Optional…" value={logForm.notes}
                    onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setLogOpen(false)} className="btn-secondary text-xs py-1.5 flex-1">Cancel</button>
                <button type="submit" disabled={logging} className="btn-primary text-xs py-1.5 flex-1">
                  {logging ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {interactions.length === 0 ? (
            <p className="text-xs text-[var(--fg-dim)] italic">No interactions logged yet</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {interactions.map((log, i) => {
                const meta = typeMap[log.type] || { Icon: Clock, label: log.type }
                const Icon = meta.Icon
                return (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="w-6 h-6 rounded-lg bg-[var(--surface-raised)] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={11} className="text-[var(--fg-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-[var(--fg)] capitalize">{meta.label}</span>
                      {log.note && <span className="text-[var(--fg-muted)]"> · {log.note}</span>}
                      <p className="text-[10px] text-[var(--fg-dim)]">{log.date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => onDelete(contact.id)}
            className="p-2.5 rounded-xl hover:bg-[var(--error-subtle)] text-[var(--fg-dim)] hover:text-[var(--error)] transition-all">
            <Trash2 size={15} />
          </button>
          <button onClick={onEdit} className="btn-primary flex-1">
            <Pencil size={14} /> Edit
          </button>
        </div>
      </div>
    </div>
    </Portal>
  )
}

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [syncMsg, setSyncMsg]   = useState('')
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(null)
  const [detail, setDetail]     = useState(null)
  const [vipOnly, setVipOnly]   = useState(false)
  const [tagFilter, setTagFilter] = useState('')

  const load = async () => {
    try {
      const PAGE = 500
      let all = [], offset = 0, total = Infinity
      while (all.length < total) {
        const { data } = await client.get(`/contacts?limit=${PAGE}&offset=${offset}`)
        const page = data.all || data.contacts || []
        all = [...all, ...page]
        total = data.total ?? all.length
        offset += page.length
        if (page.length < PAGE) break
      }
      setContacts(all)
    } finally { setLoading(false) }
  }

  const syncGoogle = async () => {
    try {
      const { data } = await client.get('/contacts/import-google')
      if (data.imported > 0) { setSyncMsg(`Synced ${data.imported} new contacts from Google`); load() }
    } catch {}
  }

  useEffect(() => { load(); syncGoogle() }, [])

  const del = async (id) => {
    await client.delete(`/contacts/${id}`)
    setDetail(null)
    load()
  }

  const vip           = contacts.filter(c => c.is_vip)
  const allTags       = [...new Set(contacts.flatMap(c => c.tags ? c.tags.split(',').map(t => t.trim()).filter(Boolean) : []))]
  const filtered      = contacts.filter(c => {
    const matchesSearch = !search || `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(search.toLowerCase())
    const matchesVip    = !vipOnly || c.is_vip
    const matchesTag    = !tagFilter || (c.tags || '').split(',').map(t => t.trim()).includes(tagFilter)
    return matchesSearch && matchesVip && matchesTag
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Contacts</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            {contacts.length} total{vip.length > 0 && ` · ${vip.length} VIP`}
          </p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={15} /> New
        </button>
      </div>

      {syncMsg && (
        <p className="text-xs px-3 py-2 rounded-xl text-[var(--fg-muted)] bg-[var(--surface-raised)] border border-[var(--border)]">{syncMsg}</p>
      )}

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-dim)]" />
          <input className="input pl-9" placeholder="Search contacts…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {vip.length > 0 && (
          <button
            onClick={() => setVipOnly(!vipOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
              vipOnly
                ? 'bg-[var(--brand-strong)] text-[var(--brand-fg)]'
                : 'bg-[var(--surface-raised)] text-[var(--fg-muted)] border border-[var(--border)] hover:bg-[var(--surface-overlay)]'
            }`}
          >
            <Star size={12} /> VIP
          </button>
        )}
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {tagFilter && (
            <button
              onClick={() => setTagFilter('')}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--brand-strong)] text-[var(--brand-fg)] flex items-center gap-1"
            >
              {tagFilter} ×
            </button>
          )}
          {allTags.filter(t => t !== tagFilter).map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--surface-overlay)] text-[var(--fg-muted)] border border-[var(--border)] hover:bg-[var(--surface-raised)] transition-all capitalize"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-[60px] rounded-2xl skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--fg-dim)]">
          <User size={36} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium text-sm text-[var(--fg)]">{search ? 'No contacts found' : 'No contacts yet'}</p>
          <p className="text-xs text-[var(--fg-dim)] mt-1">Tap "New" to add your first contact</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => setDetail(c)}
              className="card card-hover p-4 flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--fg)] font-bold text-sm shrink-0">
                {initial(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm text-[var(--fg)]">{c.name}</p>
                  {c.is_vip && <Star size={10} className="text-[var(--fg-dim)] fill-current shrink-0" />}
                </div>
                <p className="text-xs text-[var(--fg-muted)] truncate">
                  {[c.email, c.company].filter(Boolean).join(' · ')}
                </p>
                {c.tags && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {c.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(tag => (
                      <span key={tag} className="px-1.5 py-0 rounded-full text-[10px] font-medium bg-[var(--surface-overlay)] text-[var(--fg-dim)] border border-[var(--border)] capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {c.phone && <span className="text-xs text-[var(--fg-dim)] shrink-0 hidden sm:block">{c.phone}</span>}
            </div>
          ))}
        </div>
      )}

      {detail && (
        <ContactDetail
          contact={detail}
          onClose={() => setDetail(null)}
          onEdit={() => { setModal(detail); setDetail(null) }}
          onDelete={del}
          onInteractionLogged={async () => {
            await load()
            const { data } = await client.get(`/contacts/${detail.id}`).catch(() => ({ data: null }))
            if (data?.contact) setDetail(data.contact)
          }}
        />
      )}
      {modal !== null && (
        <ContactModal contact={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
    </div>
  )
}
