import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', password: '', confirmPassword: '' })
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setMessage('As senhas não conferem.')
      return
    }
    try {
      await register(form.nome, form.cpf, form.email, form.password)
      setMessage('Cadastro enviado. Agora é só esperar o admin dar aquele carimbo de aprovado 😎')
    } catch {
      setMessage('Não foi possível cadastrar agora.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <h1>Bem-vindo ao</h1>
        <h2>Portal do Investidor</h2>
        <p>Cadastre-se para acessar a sua conta.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Cadastre-se</h2>
        <input placeholder="Nome Completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
        <input placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input placeholder="Confirmar Senha" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        {message ? <div className="info-box">{message}</div> : null}
        <button type="submit">Cadastrar</button>
        <p>Já tem cadastro? <Link to="/login">Ir para o Login</Link></p>
      </form>
    </div>
  )
}
