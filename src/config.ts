// Raw GitHub URL for the live dashboard-data.json export.
// Populated after the repo is created & first pushed.
export const DATA_URL =
  'https://raw.githubusercontent.com/coolgeekme/hermes-mobile-console/main/public/dashboard-data.json'

// VAPID public key for Web Push subscriptions. Public keys are safe to ship
// in client code — only the matching private key (kept on the VPS, never
// committed to this repo) can sign push messages.
export const VAPID_PUBLIC_KEY =
  'BI6FARyXCVCgnfk8JOmpaL1GyuXufzVUqiplACWbdD2ChLe68w3arz5mhN_suymhPdVdlpWgjDFUXiFLh2hT6XM'

// Same-origin serverless endpoint (Vercel) that stores push subscriptions.
export const SUBSCRIBE_URL = '/api/subscribe'

// Same-origin serverless endpoint (Vercel) that proxies chat messages to the
// Hermes API server running on the VPS. The Hermes API key itself never
// touches the client — the proxy holds it server-side.
export const CHAT_API_URL = '/api/chat'

// Shared secret sent as x-console-key to the chat proxy. NOTE: this is
// embedded in the client bundle, so it is an obscurity-grade gate (stops
// drive-by abuse of the proxy endpoint), not a real authentication boundary.
// The actual Hermes API key stays server-side in Vercel env vars.
export const CHAT_SHARED_SECRET = 'xQXARhu3N176ujZcBBg2wwVyAK0JMAA9'
