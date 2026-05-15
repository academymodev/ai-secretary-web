'use client'
import { useEffect, useRef, useState } from 'react'
import { Mail, Send, ChevronDown, ChevronUp, Inbox, Sparkles, Trash2 } from 'lucide-react'
import client, { BASE_URL } from '@/lib/api'

function ComposeModal({ onClose, onSent, contacts }) {
  const [form, setForm]        = useState({ to: '', subject: '', body: '' })
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await client.post('/email/send', form)
      onSent()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email')
    } finally { setLoading(false) }
  }

  return (
    <div className="overlay items-end sm:items-center">
      <div className="modal w-full max-w-lg">
        <h2 className="text-base font-semibold mb-5 text-[var(--fg)] tracking-tight">Compose Email</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <p className="text-xs text-[var(--error)] bg-[var(--error-subtle)] px-3 py-2 rounded-xl">{error}</p>}
          <div>
            <label className="label">To</label>
            <input className="input" type="email" placeholder="recipient@example.com" value={form.to} onChange={set('to')} required list="contact-emails" />
            <datalist id="contact-emails">{contacts.map(c => c.email && <option key={c.id} value={c.email} label={c.name} />)}</datalist>
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={set('subject')} required />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input resize-none" rows={6} value={form.body} onChange={set('body')} required />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              <Send size={14} /> {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EmailCard({ email, onDelete }) {
  const [expanded, setExpanded]     = useState(false)
  const [draft, setDraft]           = useState('')
  const [drafting, setDrafting]     = useState(false)
  const [sending, setSending]       = useState(false)
  const [sent, setSent]             = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [replyError, setReplyError] = useState('')

  const from    = email.from_name || email.from_email || email.from || ''
  const date    = email.received_at || email.date
  const isRead  = email.is_read ?? email.read ?? true
  const summary = email.ai_summary || email.body || email.snippet || ''
  const urgent  = email.urgency === 'urgent'
  const msgId   = email.gmail_message_id || email.id

  const generateReply = async () => {
    setDrafting(true)
    setReplyError('')
    setDraft('')
    try {
      const { data } = await client.post('/email/draft-reply', { emailId: msgId })
      setDraft(data.draft || data.body || '')
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Failed to generate reply')
    } finally { setDrafting(false) }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Move this email to trash?')) return
    setDeleting(true)
    try {
      await client.delete(`/email/${msgId}`)
      onDelete(msgId)
    } catch { setDeleting(false) }
  }

  const sendReply = async () => {
    if (!draft.trim()) return
    setSending(true)
    try {
      await client.post('/email/send', {
        to:      email.from_email || email.from || '',
        subject: `Re: ${email.subject || ''}`,
        body:    draft,
      })
      setSent(true)
      setDraft('')
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Failed to send reply')
    } finally { setSending(false) }
  }

  return (
    <div className={`card transition-all duration-200 overflow-hidden ${!urgent ? 'card-hover' : ''} ${urgent ? 'border-l-2 border-l-[var(--fg)]' : ''}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${!isRead ? 'font-semibold' : 'font-medium'} text-[var(--fg)]`}>
              {email.subject || '(No subject)'}
            </p>
            <p className="text-xs text-[var(--fg-muted)] mt-0.5 truncate">{from}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {date && (
              <span className="text-xs text-[var(--fg-dim)]">
                {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {urgent && <span className="badge badge-muted text-[10px]">Urgent</span>}
            {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg)] shrink-0" />}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1 rounded-lg hover:bg-[var(--error-subtle)] text-[var(--fg-dim)] hover:text-[var(--error)] transition-colors disabled:opacity-40"
            >
              <Trash2 size={13} />
            </button>
            {expanded ? <ChevronUp size={14} className="text-[var(--fg-dim)]" /> : <ChevronDown size={14} className="text-[var(--fg-dim)]" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] space-y-3">
          <p className="text-sm text-[var(--fg)] leading-relaxed">
            {summary || <span className="italic text-[var(--fg-dim)]">No summary available</span>}
          </p>
          {sent ? (
            <p className="text-xs text-[var(--fg-muted)]">Reply sent.</p>
          ) : draft ? (
            <div className="space-y-2.5">
              <label className="text-[10px] font-semibold text-[var(--fg-dim)] uppercase tracking-widest">Draft Reply</label>
              <textarea className="input resize-none text-sm" rows={5} value={draft} onChange={e => setDraft(e.target.value)} />
              {replyError && <p className="text-xs text-[var(--error)]">{replyError}</p>}
              <div className="flex gap-2">
                <button onClick={() => setDraft('')} className="btn-secondary text-xs py-1.5 flex-1">Discard</button>
                <button onClick={sendReply} disabled={sending} className="btn-primary text-xs py-1.5 flex-1">
                  <Send size={12} /> {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {replyError && <p className="text-xs text-[var(--error)] mb-2">{replyError}</p>}
              <button onClick={generateReply} disabled={drafting} className="btn-secondary text-xs py-1.5">
                <Sparkles size={12} className="text-[var(--accent)]" />
                {drafting ? 'Generating…' : 'AI Reply'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Email() {
  const [emails, setEmails]             = useState([])
  const [contacts, setContacts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [compose, setCompose]           = useState(false)
  const [needsConnect, setNeedsConnect] = useState(false)
  const lastLoadAt                      = useRef(0)

  const load = async (force = false) => {
    // Debounce focus-triggered reloads — email inbox is slow (AI summaries)
    if (!force && Date.now() - lastLoadAt.current < 2 * 60 * 1000) return
    lastLoadAt.current = Date.now()
    setLoading(true)
    try {
      const [emailRes, contactRes] = await Promise.allSettled([
        client.get('/email/inbox?limit=50'),
        client.get('/contacts'),
      ])
      if (emailRes.status === 'fulfilled') {
        setEmails(emailRes.value.data?.emails || [])
      } else if (emailRes.reason?.response?.status === 403) {
        setNeedsConnect(true)
      }
      if (contactRes.status === 'fulfilled') setContacts(contactRes.value.data?.contacts || [])
    } finally { setLoading(false) }
  }

  useEffect(() => {
    load(true)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    const interval = setInterval(() => load(true), 5 * 60 * 1000)
    return () => { window.removeEventListener('focus', onFocus); clearInterval(interval) }
  }, [])

  const token      = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const connectUrl = `${BASE_URL}/auth/google?token=${token}`

  if (needsConnect) return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Email</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-0.5">Gmail integration</p>
      </div>
      <div className="card p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-raised)] flex items-center justify-center mx-auto mb-4">
          <Mail size={22} className="text-[var(--fg-dim)]" />
        </div>
        <h2 className="font-semibold text-sm mb-1 text-[var(--fg)]">Connect Google Account</h2>
        <p className="text-xs text-[var(--fg-muted)] mb-5 max-w-xs mx-auto leading-relaxed">
          Link your Google account to read emails and send replies directly from here.
        </p>
        <a href={connectUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Connect Google Account
        </a>
        <button onClick={load} className="block mx-auto mt-3 text-xs text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors">
          Already connected? Refresh
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Email</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">{emails.length} messages</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCompose(true)} className="btn-primary">
            <Send size={14} /> Compose
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-[60px] rounded-2xl skeleton" />)}
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-16">
          <Inbox size={36} className="mx-auto mb-3 text-[var(--fg-dim)] opacity-25" />
          <p className="font-medium text-sm text-[var(--fg)]">Inbox is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((e, i) => (
            <EmailCard
              key={e.gmail_message_id || e.id || i}
              email={e}
              onDelete={(id) => setEmails(prev => prev.filter(x => (x.gmail_message_id || x.id) !== id))}
            />
          ))}
        </div>
      )}

      {compose && <ComposeModal contacts={contacts} onClose={() => setCompose(false)} onSent={() => { setCompose(false); load() }} />}
    </div>
  )
}
