import type { VercelRequest, VercelResponse } from '@vercel/node'

const REPO_OWNER = 'coolgeekme'
const REPO_NAME = 'hermes-mobile-console'
const FILE_PATH = 'subscriptions.json'
const BRANCH = 'main'

interface StoredSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
  addedAt: string
}

function githubHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'hermes-mobile-console-subscribe',
  }
}

async function getExistingFile(token: string): Promise<{ sha: string | null; subs: StoredSubscription[] }> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`
  const res = await fetch(url, { headers: githubHeaders(token) })
  if (res.status === 404) {
    return { sha: null, subs: [] }
  }
  if (!res.ok) {
    throw new Error(`GitHub GET failed: ${res.status}`)
  }
  const json = await res.json()
  const content = Buffer.from(json.content, json.encoding || 'base64').toString('utf-8')
  let subs: StoredSubscription[] = []
  try {
    const parsed = JSON.parse(content)
    subs = Array.isArray(parsed) ? parsed : Array.isArray(parsed.subscriptions) ? parsed.subscriptions : []
  } catch {
    subs = []
  }
  return { sha: json.sha, subs }
}

async function putFile(token: string, sha: string | null, subs: StoredSubscription[]) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`
  const body: any = {
    message: 'chore: update push subscriptions',
    content: Buffer.from(JSON.stringify(subs, null, 2)).toString('base64'),
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  const res = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GitHub PUT failed: ${res.status} ${text.slice(0, 300)}`)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    res.status(500).json({ error: 'Server not configured (missing GITHUB_TOKEN)' })
    return
  }

  const body = req.body
  if (!body || typeof body.endpoint !== 'string' || !body.keys) {
    res.status(400).json({ error: 'Invalid subscription payload' })
    return
  }

  const incoming: StoredSubscription = {
    endpoint: body.endpoint,
    keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
    addedAt: new Date().toISOString(),
  }

  try {
    const { sha, subs } = await getExistingFile(token)
    const deduped = subs.filter((s) => s.endpoint !== incoming.endpoint)
    deduped.push(incoming)
    await putFile(token, sha, deduped)
    res.status(200).json({ ok: true, count: deduped.length })
  } catch (err: any) {
    console.error('subscribe endpoint error', err?.message || err)
    res.status(502).json({ error: 'Failed to persist subscription' })
  }
}
