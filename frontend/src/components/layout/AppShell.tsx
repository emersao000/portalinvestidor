import { Outlet, NavLink } from 'react-router-dom'

const items = [
  ['/', 'Início'],
  ['/', 'Dashboard'],
  ['/usuarios', 'Usuários'],
  ['/unidades', 'Unidades'],
  ['/arquivos', 'Arquivos'],
  ['/investidor', 'Investidor'],
]

export function AppShell() {
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
        <button className="dark-pill">Sair</button>
        <button className="outline-pill">Ajuda</button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div />
          <div className="avatar-wrap">
            <div className="avatar">LF</div>
            <span>Luis Felipe</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
