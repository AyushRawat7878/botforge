import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const handleAuth = (data) => {
    setToken(data.access_token)
    setUser(data.user)
  }

  const login = (username, password) => api('/auth/login', { method: 'POST', body: { username, password } }).then(handleAuth)
  const register = (username, email, password) =>
    api('/auth/register', { method: 'POST', body: { username, email, password } }).then(handleAuth)
  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
