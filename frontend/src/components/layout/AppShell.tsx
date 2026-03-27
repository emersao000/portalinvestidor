import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AppShell() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const adminItems = [
    ['/dashboard', 'Dashboard'],
    ['/usuarios', 'Usuários'],
    ['/unidades', 'Unidades'],
    ['/arquivos', 'Arquivos'],
  ]

  const investorItems = [
    ['/investidor', 'Minhas Unidades'],
    ['/unidades', 'Unidades'],
    ['/arquivos', 'Arquivos'],
  ]

  const items = user?.role === 'admin' ? adminItems : investorItems

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userInitial = user?.nome ? user.nome.split(' ')[0][0].toUpperCase() : '?'
  const userName = user?.nome ? user.nome.split(' ')[0] : 'Usuário'

  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="brand-mark" />
        <div className="brand-name">EVOQUE ACADEMIA</div>
        <nav className="sidebar-nav">
          {items.map(([to, label], index) => (
            <NavLink key={`${label}-${index}`} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">◦</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="dark-pill" onClick={handleLogout}>
          Sair
        </button>
        <button className="outline-pill">Ajuda</button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div />
          <div className="avatar-wrap">
            <div className="avatar">{userInitial}</div>
            <span>{userName}</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
