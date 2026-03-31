import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import api from '../lib/api'

export interface User {
  id: number
  nome: string
  sobrenome?: string | null
  email: string
  telefone?: string | null
  role: 'admin' | 'investor'
  is_authorized: boolean
  must_change_password?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>
  register: (nome: string, cpf: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('portal_token')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const { data } = await api.get('/auth/me')
      localStorage.setItem('portal_user', JSON.stringify(data))
      setUser(data)
    } catch {
      localStorage.removeItem('portal_token')
      localStorage.removeItem('portal_user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('portal_token', data.access_token)
    localStorage.setItem('portal_user', JSON.stringify(data.user))
    setUser(data.user)
    return { mustChangePassword: !!data.must_change_password }
  }

  const register = async (nome: string, cpf: string, email: string, password: string) => {
    await api.post('/auth/register', { nome, cpf, email, password })
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })

    const { data } = await api.get('/auth/me')
    localStorage.setItem('portal_user', JSON.stringify(data))
    setUser(data)
  }

  const logout = () => {
    localStorage.removeItem('portal_token')
    localStorage.removeItem('portal_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
