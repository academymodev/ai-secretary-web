'use client'
import { useEffect, useRef, useState } from 'react'
import { Send, User, Trash2, Mic, MicOff, Search, X } from 'lucide-react'
import client from '@/lib/api'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

marked.setOptions({ breaks: true, gfm: true })

function renderMarkdown(text) {
  const raw  = marked.parse(text)
  const safe = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['p','br','strong','em','ul','ol','li','a','table','thead','tbody','tr','th','td','div','span','h1','h2','h3','h4','code','pre'],
    ALLOWED_ATTR: ['href','target','rel','style'],
    ALLOW_DATA_ATTR: false,
  })
  return <div className="prose-chat" dangerouslySetInnerHTML={{ __html: safe }} />
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? (
        <div className="w-7 h-7 rounded-full bg-[var(--brand-strong)] flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-[var(--brand-fg)]" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5">
          <img src="/logo192.png" alt="AI" className="w-full h-full object-cover" />
        </div>
      )}
      <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-[var(--brand-strong)] text-[var(--brand-fg)] rounded-tr-md'
          : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--fg)] rounded-tl-md'
      }`}>
        {isUser ? msg.content : renderMarkdown(msg.content)}
      </div>
    </div>
  )
}

function ClearDialog({ onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal max-w-xs text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--error-subtle)] flex items-center justify-center mx-auto mb-4">
          <Trash2 size={16} className="text-[var(--error)]" />
        </div>
        <h2 className="font-semibold text-sm mb-2 text-[var(--fg)]">Clear chat history?</h2>
        <p className="text-xs text-[var(--fg-muted)] mb-5 leading-relaxed">All messages will be permanently removed.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-full font-semibold text-sm bg-[var(--error)] text-white hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [histLoading, setHistLoading] = useState(true)
  const [showClear, setShowClear]     = useState(false)
  const [recording, setRecording]     = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching]     = useState(false)
  const [showSearch, setShowSearch]   = useState(false)
  const bottomRef                     = useRef(null)
  const inputRef                      = useRef(null)
  const searchTimerRef                = useRef(null)
  const mediaRecorderRef              = useRef(null)
  const chunksRef                     = useRef([])

  useEffect(() => {
    client.get('/chat/history')
      .then(({ data }) => setMessages((data.history || []).slice(-50)))
      .catch(() => {})
      .finally(() => setHistLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    inputRef.current?.focus()
    try {
      const allMsgs  = [...messages, userMsg]
      const { data } = await client.post('/chat/message', {
        messages: allMsgs.map(m => ({ role: m.role, content: m.content }))
      })
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const msg = err.response?.data?.error || 'Sorry, something went wrong.'
      setMessages(m => [...m, { role: 'assistant', content: msg }])
    } finally { setLoading(false) }
  }

  const clearHistory = async () => {
    await client.delete('/chat/history').catch(() => {})
    setMessages([])
    setShowClear(false)
  }

  const handleSearch = (q) => {
    setSearchQuery(q)
    clearTimeout(searchTimerRef.current)
    if (!q.trim()) { setSearchResults(null); return }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await client.get(`/chat/history/search?q=${encodeURIComponent(q.trim())}`)
        setSearchResults(data.results || [])
      } catch { setSearchResults([]) } finally { setSearching(false) }
    }, 300)
  }

  const closeSearch = () => { setShowSearch(false); setSearchQuery(''); setSearchResults(null) }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr     = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        setTranscribing(true)
        try {
          const fd = new FormData()
          fd.append('audio', blob, 'recording.webm')
          const { data } = await client.post('/voice/transcribe', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          if (data.text) {
            setInput(prev => prev ? prev + ' ' + data.text : data.text)
            inputRef.current?.focus()
          }
        } catch {} finally { setTranscribing(false) }
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
    } catch {}
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setRecording(false)
  }

  const toggleRecording = () => recording ? stopRecording() : startRecording()

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Chat</h1>
          <p className="text-sm text-[var(--fg-muted)]">AI-powered assistant</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(s => !s)}
            className={`btn-ghost text-xs ${showSearch ? 'text-[var(--fg)]' : 'text-[var(--fg-dim)]'} hover:text-[var(--fg)]`}
          >
            <Search size={14} />
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => setShowClear(true)}
              className="btn-ghost text-xs text-[var(--fg-dim)] hover:text-[var(--error)]"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)] pointer-events-none" />
          <input
            className="input pl-9 pr-9 text-sm"
            placeholder="Search chat history…"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button onClick={closeSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-dim)] hover:text-[var(--fg)]">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Messages / search results */}
      <div className="flex-1 overflow-y-auto card p-4 space-y-4 mb-3">
        {showSearch && searchQuery ? (
          searching ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="typing-dot" style={{ animationDelay: `${i*0.18}s` }} />)}</div>
            </div>
          ) : !searchResults?.length ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Search size={28} className="text-[var(--fg-dim)] opacity-30" />
              <p className="text-sm text-[var(--fg-dim)]">No messages found</p>
            </div>
          ) : (
            searchResults.map((m, i) => (
              <div key={m.id || i} className="space-y-1">
                <span className="text-[10px] text-[var(--fg-dim)]">
                  {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <Message msg={m} />
              </div>
            ))
          )
        ) : histLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
            <div className="w-12 h-12 rounded-2xl overflow-hidden">
              <img src="/logo192.png" alt="AI" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm text-[var(--fg)]">Ask your secretary</p>
              <p className="text-xs text-[var(--fg-dim)] mt-0.5">Summarize tasks, draft emails, plan your day</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} msg={m} />)
        )}
        {!showSearch && loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden mt-0.5 shrink-0">
              <img src="/logo192.png" alt="AI" className="w-full h-full object-cover" />
            </div>
            <div className="px-3.5 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl rounded-tl-md flex items-center gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <button
          onClick={toggleRecording}
          disabled={transcribing}
          aria-label={recording ? 'Stop recording' : 'Start voice input'}
          className={`px-3 rounded-xl border transition-all ${
            recording
              ? 'bg-[var(--error)] border-[var(--error)] text-white animate-pulse'
              : 'border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-strong)]'
          } disabled:opacity-40`}
        >
          {recording ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        <input
          ref={inputRef}
          className="input flex-1"
          placeholder={transcribing ? 'Transcribing…' : recording ? 'Recording… click mic to stop' : 'Ask anything…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={transcribing}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="btn-primary px-4 disabled:opacity-30"
        >
          <Send size={15} />
        </button>
      </div>

      {showClear && <ClearDialog onConfirm={clearHistory} onCancel={() => setShowClear(false)} />}
    </div>
  )
}
