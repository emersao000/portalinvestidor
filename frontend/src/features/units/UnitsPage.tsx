import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Unit } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { UnitFormModal } from '../../components/modals/UnitFormModal'

export function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>()

  const loadUnits = () => {
    api.get('/units').then((res) => setUnits(res.data)).catch(() => setUnits([]))
  }

  useEffect(() => {
    loadUnits()
  }, [])

  const filteredUnits = units.filter((unit) =>
    unit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenCreateModal = () => {
    setEditingUnit(undefined)
    setShowModal(true)
  }

  const handleOpenEditModal = (unit: Unit) => {
    setEditingUnit(unit)
    setShowModal(true)
  }

  const handleSubmit = async (data: Partial<Unit>) => {
    try {
      if (editingUnit) {
        await api.patch(`/units/${editingUnit.id}`, data)
      } else {
        await api.post('/units', data)
      }
      loadUnits()
    } catch (err) {
      throw err
    }
  }

  const handleDelete = async (unitId: number) => {
    if (!window.confirm('Tem certeza que deseja deletar esta unidade?')) return
    try {
      await api.delete(`/units/${unitId}`)
      loadUnits()
    } catch (err) {
      console.error('Erro ao deletar unidade:', err)
    }
  }

  return (
    <div>
      <SectionHeader
        title="Unidades"
        action={
          <div className="header-actions">
            <button className="outline-soft">Exportar</button>
            <button className="outline-soft" onClick={handleOpenCreateModal}>
              + Cadastrar unidade
            </button>
          </div>
        }
      />
      <div className="search-bar">
        <input
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button>⌕</button>
      </div>
      <div className="list-stack">
        {filteredUnits.map((unit) => (
          <div className="unit-card" key={unit.id}>
            <div className="unit-photo">SEM FOTO</div>
            <div className="unit-info">
              <strong>{unit.nome}</strong>
              <p>{[unit.endereco, unit.cidade, unit.estado].filter(Boolean).join(' - ')}</p>
              <span>{unit.status_texto}</span>
            </div>
            <div className="unit-actions">
              <button onClick={() => handleOpenEditModal(unit)} title="Editar">✎</button>
              <button onClick={() => handleDelete(unit.id)} title="Deletar">🗑</button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <UnitFormModal
          unit={editingUnit}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
