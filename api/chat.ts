import type { VercelRequest, VercelResponse } from '@vercel/node'

// Allow long agent turns (Vercel Hobby caps at 60s).
export const config = { maxDuration: 60 }

const BASE = (process.env.API_SERVER_BASE_URL || '').replace(/\/$/, '')
const KEY = process.env.API_SERVER_KEY || ''
const SHARED = process.env.CHAT_SHARED_SECRET || ''

// Best-effort per-instance rate limiting (serverless instances are ephemeral,
// so this is a speed bump, not a hard guarantee).
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const hits = new Map<string, { count: number; reset: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const rec = hits.get(ip)
  if (!rec || now >= rec.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS })
    return false
  }
  rec.count += 1
  return rec.count > MAX_PER_WINDOW
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!BASE || !KEY || !SHARED) {
    return res.status(500).json({ error: 'Chat backend not configured' })
  }
  if (req.headers['x-console-key'] !== SHARED) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const ip = ((req.headers['x-forwarded-for'] as string) || 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests — slow down a little.' })
  }

  const body = req.body || {}
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message || message.length > 4000) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  const headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
  let sid: string | null =
    typeof body.session_id === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(body.session_id)
      ? body.session_id
      : null

  try {
    if (!sid) {
      const r = await fetch(`${BASE}/api/sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'Mobile Console Chat' }),
      })
      if (!r.ok) return res.status(502).json({ error: 'Failed to create chat session' })
      const j = await r.json()
      sid = j?.session?.id ?? null
      if (!sid) return res.status(502).json({ error: 'Failed to create chat session' })
    }

    const r = await fetch(`${BASE}/api/sessions/${sid}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    })
    if (r.status === 404) {
      // Session vanished server-side — tell the client to drop it and retry fresh.
      return res.status(404).json({ error: 'session_expired' })
    }
    if (!r.ok) {
      return res.status(502).json({ error: 'Agent request failed' })
    }
    const j = await r.json()
    return res.status(200).json({
      session_id: j.session_id || sid,
      reply: j?.message?.content ?? '',
    })
  } catch (err: any) {
    console.error('chat proxy error', err?.message || err)
    return res.status(502).json({ error: 'Chat backend unreachable' })
  }
}
