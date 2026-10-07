// Small wrapper around fetch that adds the JWT and turns API errors into readable messages.
const TOKEN_KEY = 'botforge_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken(null)
      window.location.href = '/login'
    }
    let message = data.detail || `Request failed (${res.status})`
    if (Array.isArray(message)) message = message.map((d) => `${d.loc?.at(-1)}: ${d.msg}`).join(', ')
    throw new Error(message)
  }
  return data
}
