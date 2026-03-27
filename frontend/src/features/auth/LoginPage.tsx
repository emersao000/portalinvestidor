import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    try {
      await login(email, password)
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
