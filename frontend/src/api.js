// API configuration for deployment
// In production (Vercel), VITE_API_URL points to the Render backend
// In development, it's empty and relative paths go through Vite proxy

export const API_BASE = import.meta.env.VITE_API_URL || ''

export const getApiUrl = (path) => `${API_BASE}${path}`

export const getWsUrl = () => {
  if (API_BASE) {
    // Production: convert https://xxx.onrender.com to wss://xxx.onrender.com
    const url = new URL(API_BASE)
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${url.host}/ws/stream`
  }
  // Development: use current host (Vite proxy handles it)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/stream`
}
