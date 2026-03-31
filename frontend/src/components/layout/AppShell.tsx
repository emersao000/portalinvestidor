import { HelpCircle, LayoutDashboard, LogOut, Building2, Users, FolderOpen, House, ChevronDown } from 'lucide-react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AppShell() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const adminItems = [
    ['/dashboard', 'Dashboard', LayoutDashboard],
    ['/usuarios', 'Usuários', Users],
    ['/unidades', 'Unidades', Building2],
    ['/arquivos', 'Arquivos', FolderOpen],
  ] as const

  const investorItems = [
    ['/investidor', 'Minhas Unidades', House],
    ['/arquivos', 'Arquivos', FolderOpen],
  ] as const

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
          {items.map(([to, label, Icon]) => (
            <NavLink key={label} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="dark-pill" onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>
        <button className="outline-pill">
          <HelpCircle size={18} />
          Ajuda
        </button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div />
          <div className="avatar-wrap">
            <div className="avatar">{userInitial}</div>
            <span>{userName}</span>
            <ChevronDown size={16} />
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
