'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, Trash2, Pencil, User, Mail, Phone, Building2, FileText, Star, X, Plus } from 'lucide-react'
import client from '@/lib/api'

function ContactModal({ contact, onClose, onSave }) {
  const isEdit = !!contact?.id
  const [form, setForm] = useState({
    name:    contact?.name    || '',
    email:   contact?.email   || '',
    phone:   contact?.phone   || '',
    company: contact?.company || '',
    notes:   contact?.notes   || '',
    is_vip:  contact?.is_vip  || false,
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
  )
}

function ContactDetail({ contact, onClose, onEdit, onDelete }) {
  return (
    <div className="overlay items-end sm:items-center">
      <div className="modal w-full max-w-md">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-strong)] text-[var(--brand-fg)] flex items-center justify-center text-lg font-bold shrink-0">
              {contact.name[0]?.toUpperCase()}
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

        <div className="space-y-2 mb-5">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-overlay)] transition-colors group">
              <Mail size={15} className="text-[var(--fg-dim)] shrink-0" />
              <span className="text-sm text-[var(--fg)] group-hover:underline">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-overlay)] transition-colors group">
              <Phone size={15} className="text-[var(--fg-dim)] shrink-0" />
              <span className="text-sm text-[var(--fg)] group-hover:underline">{contact.phone}</span>
            </a>
          )}
          {contact.company && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-raised)]">
              <Building2 size={15} className="text-[var(--fg-dim)] shrink-0" />
              <span className="text-sm text-[var(--fg)]">{contact.company}</span>
            </div>
          )}
          {contact.notes && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-raised)]">
              <FileText size={15} className="text-[var(--fg-dim)] shrink-0 mt-0.5" />
              <span className="text-sm text-[var(--fg)] whitespace-pre-line">{contact.notes}</span>
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

  const load = async () => {
    try {
      const { data } = await client.get('/contacts?limit=500')
      setContacts(data.all || data.contacts || [])
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

  const vip      = contacts.filter(c => c.is_vip)
  const filtered = contacts.filter(c =>
    (!vipOnly || c.is_vip) &&
    (!search || `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(search.toLowerCase()))
  )

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
                {c.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm text-[var(--fg)]">{c.name}</p>
                  {c.is_vip && <Star size={10} className="text-[var(--fg-dim)] fill-current shrink-0" />}
                </div>
                <p className="text-xs text-[var(--fg-muted)] truncate">
                  {[c.email, c.company].filter(Boolean).join(' · ')}
                </p>
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
        />
      )}
      {modal !== null && (
        <ContactModal contact={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
    </div>
  )
}
