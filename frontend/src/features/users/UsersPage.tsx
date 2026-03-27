import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { User, Unit } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Pagination } from '../../components/ui/Pagination'
import { UserEditModal } from '../../components/modals/UserEditModal'

const ITEMS_PER_PAGE = 10

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState<User | undefined>()

  const loadUsers = () => {
    api.get('/users').then((res) => setUsers(res.data)).catch(() => setUsers([]))
  }

  const loadUnits = () => {
    api.get('/units').then((res) => setUnits(res.data)).catch(() => setUnits([]))
  }

  useEffect(() => {
    loadUsers()
    loadUnits()
  }, [])

  const filteredUsers = users.filter((user) =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleSubmitUser = async (data: Partial<User>) => {
    try {
      await api.patch(`/users/${editingUser!.id}`, data)
      loadUsers()
    } catch (err) {
      throw err
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return
    try {
      await api.delete(`/users/${userId}`)
      loadUsers()
    } catch (err) {
      console.error('Erro ao deletar usuário:', err)
    }
  }

  return (
    <div className="users-page-wrap">
      <SectionHeader title="Usuários" action={<button className="outline-soft">Exportar</button>} />
      <div className="search-bar user-search">
        <input
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
        <button>⌕</button>
      </div>
      <div className="list-stack">
        {paginatedUsers.map((user) => (
          <div className="user-card" key={user.id}>
            <div className="unit-photo">SEM FOTO</div>
            <div className="user-name">{user.nome}</div>
            <div className="user-mail">{user.email}</div>
            <div className="user-role">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</div>
            <div className="user-actions">
              <button onClick={() => handleEditUser(user)} title="Editar">✎</button>
              <button onClick={() => handleDeleteUser(user.id)} title="Deletar">🗑</button>
            </div>
          </div>
        ))}
      </div>
      {filteredUsers.length > 0 && (
        <>
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '16px' }}>
            Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredUsers.length)} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuários
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          units={units}
          onClose={() => setEditingUser(undefined)}
          onSubmit={handleSubmitUser}
        />
      )}
    </div>
  )
}
