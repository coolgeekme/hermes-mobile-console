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
