import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { User, Unit } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data)).catch(() => setUsers([]))
    api.get('/units').then((res) => setUnits(res.data)).catch(() => setUnits([]))
  }, [])

  return (
    <div className="users-page-wrap">
      <SectionHeader title="Usuários" action={<button className="outline-soft">Exportar</button>} />
      <div className="search-bar user-search"><input placeholder="Pesquisar" /><button>⌕</button></div>
      <div className="list-stack">
        {users.map((user) => (
          <div className="user-card" key={user.id}>
            <div className="unit-photo">SEM FOTO</div>
            <div className="user-name">{user.nome}</div>
            <div className="user-mail">{user.email}</div>
            <div className="user-role">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</div>
            <div className="user-actions">✎ ☑</div>
          </div>
        ))}
      </div>
    </div>
  )
}
