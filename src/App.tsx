import React, { useEffect, useRef, useState } from 'react'
import type { DashboardData } from './types'
import { DATA_URL } from './config'
import Drawer from './Drawer'

interface ChatMessage {
  id: number
  from: 'agent' | 'user'
  text?: string
  card?: { title: string; rows: { k: string; v: string }[] }
}

let msgId = 0

function buildBriefCard(data: DashboardData | null): ChatMessage {
  const rows =
    data && data.calendar.length > 0
      ? data.calendar.slice(0, 4).map((e) => ({ k: e.time, v: e.title }))
      : [{ k: '—', v: 'No events found for today' }]
  const today = new Date()
  const label = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return {
    id: msgId++,
    from: 'agent',
    card: { title: `📅 Today · ${label}`, rows },
  }
}

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: msgId++, from: 'agent', text: "Morning! Here's today's brief:" },
  ])
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  const load = () => {
    setLoadError(null)
    fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then((d: DashboardData) => {
        setData(d)
        setMessages((prev) => {
          if (prev.some((m) => m.card)) return prev
          return [...prev, buildBriefCard(d)]
        })
      })
      .catch((e) => setLoadError(String(e.message || e)))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight })
  }, [messages])

  const send = (text?: string) => {
    const val = (text ?? input).trim()
    if (!val) return
    setMessages((prev) => [...prev, { id: msgId++, from: 'user', text: val }])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: msgId++, from: 'agent', text: 'On it. (This demo UI does not execute live agent actions.)' },
      ])
    }, 500)
  }

  const quickReply = (label: string) => {
    if (label.includes('dashboard')) {
      setDrawerOpen(true)
      return
    }
    send(label)
  }

  return (
    <div className="w-full h-full flex justify-center overflow-hidden bg-bg">
      <div className="relative w-full max-w-[430px] h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-bg/90 backdrop-blur relative z-10">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-[34px] h-[34px] rounded-[10px] glass-card flex items-center justify-center text-base"
            aria-label="Open dashboard"
          >
            ☰
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold">Hermes</h1>
            <div className="text-[10px] text-green">● online</div>
          </div>
          <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-sm">
            R
          </div>
        </header>

        {/* Chat body */}
        <div
          ref={chatRef}
          className="overflow-y-auto px-4 py-4 chat-body"
          style={{ height: 'calc(100vh - 62px - 104px)' }}
        >
          <div className="text-center text-[10.5px] text-muted mb-4">Today</div>
          {loadError && (
            <div className="text-center text-[10.5px] text-orange mb-3">
              Live data unavailable ({loadError}) — showing local UI only.
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex mb-3 ${m.from === 'user' ? 'justify-end' : ''}`}>
              {m.card ? (
                <div className="glass-card rounded-[14px] px-3.5 py-3 max-w-[82%]" style={{ borderColor: '#22d3ee44' }}>
                  <div className="text-[12.5px] font-bold text-cyan mb-1.5">{m.card.title}</div>
                  {m.card.rows.map((r, i) => (
                    <div key={i} className="flex justify-between gap-2.5 text-xs text-[#a9b5c4] py-0.5">
                      <span className="flex-shrink-0 text-muted">{r.k}</span>
                      <span className="text-right">{r.v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-snug ${
                    m.from === 'user'
                      ? 'bg-gradient-to-br from-cyan/[.16] to-purple/[.16] border border-cyan/30 rounded-br-[4px]'
                      : 'glass-card rounded-bl-[4px]'
                  }`}
                >
                  {m.text}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick chips */}
        <div className="flex gap-2 overflow-x-auto px-4 py-2 quick-chips">
          {['📊 Open dashboard', '✉️ Pending drafts', '⏰ Cron status'].map((c) => (
            <button
              key={c}
              onClick={() => quickReply(c)}
              className="text-[11.5px] px-3 py-1.5 rounded-full border border-border bg-[#111621b3] text-[#b7c2d0] whitespace-nowrap"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div
          className="flex items-center gap-2 px-3 pt-2 border-t border-border bg-bg/90"
          style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            type="text"
            placeholder="Message Hermes..."
            className="flex-1 glass-card rounded-[20px] px-3.5 py-2.5 text-[13.5px] outline-none text-[#e6edf5] placeholder:text-muted"
          />
          <button
            onClick={() => send()}
            className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-cyan to-purple text-bg font-bold text-[15px] flex items-center justify-center flex-shrink-0"
          >
            →
          </button>
        </div>

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} data={data} onRefresh={load} />
      </div>
    </div>
  )
}
