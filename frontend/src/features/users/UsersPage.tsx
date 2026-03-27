import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { User, Unit } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { UserEditModal } from '../../components/modals/UserEditModal'

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data)).catch(() => setUsers([
      { id: 1, nome: 'Aaa Ti Testes', email: 'teste@evoque.com', cpf: '51403556806', role: 'investor', is_active: true, is_authorized: false, unit_ids: [1, 2] },
      { id: 2, nome: 'Aldo Rodrigues Teixeira', email: 'aldo@evoque.com', cpf: '11111111111', role: 'investor', is_active: true, is_authorized: true, unit_ids: [2] },
    ]))
    api.get('/units').then((res) => setUnits(res.data)).catch(() => setUnits([
      { id: 1, nome: 'Ipiranga - Clube', endereco: '', cidade: '', estado: '', status_texto: 'Unidade a inaugurar' },
      { id: 2, nome: 'RUI BARBOSA', endereco: '', cidade: '', estado: '', status_texto: 'Unidade inaugurada' },
      { id: 3, nome: 'Rio Branco', endereco: '', cidade: '', estado: '', status_texto: 'Unidade inaugurada' },
      { id: 4, nome: 'Santos', endereco: '', cidade: '', estado: '', status_texto: 'Unidade inaugurada' },
      { id: 5, nome: 'alameda', endereco: '', cidade: '', estado: '', status_texto: 'Unidade inaugurada' },
    ]))
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
      {users[0] && <UserEditModal user={users[0]} units={units} />}
    </div>
  )
}
