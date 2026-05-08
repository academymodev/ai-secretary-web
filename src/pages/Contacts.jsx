import { useEffect, useRef, useState } from 'react'
import { Search, Trash2, Pencil, User, Mail, Phone, Building2, FileText, Star, X, Plus } from 'lucide-react'
import client from '../api/client'

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

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Contact' : 'New Contact'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-sm text-danger bg-danger-subtle px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="col-span-2">
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={set('company')} />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input id="vip" type="checkbox" checked={form.is_vip}
                onChange={(e) => setForm((f) => ({ ...f, is_vip: e.target.checked }))}
                className="w-4 h-4 rounded" />
              <label htmlFor="vip" className="text-sm font-medium text-fg flex items-center gap-1.5">
                <Star size={14} className="text-fg-muted" /> Mark as VIP
              </label>
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

function ContactDetail({ contact, onClose, onEdit, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-raised flex items-center justify-center text-xl font-bold text-fg shrink-0">
              {contact.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{contact.name}</h2>
                {contact.is_vip && <Star size={14} className="text-fg-muted fill-current" />}
              </div>
              {contact.company && <p className="text-sm text-fg-muted">{contact.company}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-raised text-fg-dim transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-raised hover:bg-surface-overlay transition-colors group">
              <Mail size={16} className="text-fg-muted shrink-0" />
              <span className="text-sm text-fg group-hover:underline">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-raised hover:bg-surface-overlay transition-colors group">
              <Phone size={16} className="text-fg-muted shrink-0" />
              <span className="text-sm text-fg group-hover:underline">{contact.phone}</span>
            </a>
          )}
          {contact.company && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-raised">
              <Building2 size={16} className="text-fg-muted shrink-0" />
              <span className="text-sm text-fg">{contact.company}</span>
            </div>
          )}
          {contact.notes && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-raised">
              <FileText size={16} className="text-fg-muted shrink-0 mt-0.5" />
              <span className="text-sm text-fg whitespace-pre-line">{contact.notes}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => onDelete(contact.id)}
            className="p-2.5 rounded-lg hover:bg-danger-subtle text-fg-dim hover:text-danger transition-colors">
            <Trash2 size={16} />
          </button>
          <button onClick={onEdit} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Pencil size={15} /> Edit
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
      const { data } = await client.get('/contacts')
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
    if (!confirm('Delete this contact?')) return
    await client.delete(`/contacts/${id}`)
    setDetail(null)
    load()
  }

  const vip = contacts.filter(c => c.is_vip)
  const filtered = contacts.filter((c) =>
    (!vipOnly || c.is_vip) &&
    (!search || `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-fg-muted">{contacts.length} total{vip.length > 0 && ` · ${vip.length} VIP`}</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New
        </button>
      </div>

      {syncMsg && (
        <p className="text-sm px-3 py-2 rounded-lg text-fg bg-surface-raised">{syncMsg}</p>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim" />
          <input className="input pl-9" placeholder="Search contacts…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {vip.length > 0 && (
          <button onClick={() => setVipOnly(!vipOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
              vipOnly
                ? 'bg-brand-strong text-brand-fg shadow-sm'
                : 'bg-surface text-fg-muted border border-line hover:bg-surface-raised'
            }`}>
            <Star size={14} /> VIP
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-surface-raised rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-fg-dim">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>{search ? 'No contacts found' : 'No contacts yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} onClick={() => setDetail(c)}
              className="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center text-fg font-bold text-sm shrink-0">
                {c.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm">{c.name}</p>
                  {c.is_vip && <Star size={11} className="text-fg-dim fill-current shrink-0" />}
                </div>
                <p className="text-xs text-fg-muted truncate">{[c.email, c.company].filter(Boolean).join(' · ')}</p>
              </div>
              {c.phone && <span className="text-xs text-fg-dim shrink-0 hidden sm:block">{c.phone}</span>}
            </div>
          ))}
        </div>
      )}

      {detail && (
        <ContactDetail contact={detail} onClose={() => setDetail(null)}
          onEdit={() => { setModal(detail); setDetail(null) }} onDelete={del} />
      )}
      {modal !== null && (
        <ContactModal contact={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />
      )}
    </div>
  )
}
