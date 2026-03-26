import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synthia_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('synthia_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('synthia_user')
    }
  }, [user])

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('synthia_users') || '[]')
    const found = users.find(u => u.email === email && u.password === password)
    if (found) {
      const userData = { email: found.email, name: found.name, id: found.id }
      setUser(userData)
      return { success: true }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('synthia_users') || '[]')
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' }
    }
    // Auto-capitalize first letter of name
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
    const newUser = { id: Date.now().toString(), name: capitalizedName, email, password }
    users.push(newUser)
    localStorage.setItem('synthia_users', JSON.stringify(users))
    const userData = { email: newUser.email, name: newUser.name, id: newUser.id }
    setUser(userData)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
