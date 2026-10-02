import React, { createContext, useContext, useState, useCallback } from 'react'
import { api, getToken, setToken, clearToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    if (!getToken()) { setLoading(false); return }
    try {
      const data = await api('/auth/me')
      setUser(data.user)
      setCompany(data.company)
    } catch {
      clearToken()
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setToken(data.token)
    setUser(data.user)
    setCompany(data.company)
    return data
  }, [])

  const register = useCallback(async (body) => {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(body) })
    setToken(data.token)
    setUser(data.user)
    setCompany(data.company)
    return data
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setCompany(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, company, loading, fetchMe, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
