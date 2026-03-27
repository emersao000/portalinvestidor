import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../lib/api'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@evoque.local')
  const [password, setPassword] = useState('Admin@1234')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('portal_token', data.access_token)
      localStorage.setItem('portal_user', JSON.stringify(data.user))
      navigate('/')
    } catch {
      setError('Não foi possível entrar. Verifique as credenciais.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <h1>Bem-vindo ao</h1>
        <h2>Portal do Investidor</h2>
        <p>Acesse sua conta com segurança.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" />
        {error ? <div className="error-box">{error}</div> : null}
        <button type="submit">Entrar</button>
        <p>Não tem cadastro? <Link to="/cadastro">Cadastre-se</Link></p>
      </form>
    </div>
  )
}
