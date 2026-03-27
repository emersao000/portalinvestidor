import { useState } from 'react'
import { User, Unit } from '../../types'

interface UserEditModalProps {
  user: User
  units: Unit[]
  onClose: () => void
  onSubmit: (data: Partial<User>) => Promise<void>
}

export function UserEditModal({ user, units, onClose, onSubmit }: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    is_authorized: user.is_authorized,
    role: user.role,
    is_active: user.is_active,
    unit_ids: user.unit_ids,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleUnitToggle = (unitId: number) => {
    setFormData((prev) => {
      const unit_ids = prev.unit_ids || []
      return {
        ...prev,
        unit_ids: unit_ids.includes(unitId)
          ? unit_ids.filter((id) => id !== unitId)
          : [...unit_ids, unitId],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao atualizar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar usuário</h2>
          <button onClick={onClose} className="modal-close-btn">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* User Info Section */}
          <div className="modal-section">
            <h3>Informações do usuário</h3>
            <div className="form-group">
              <label>Nome</label>
              <input type="text" value={user.nome} disabled style={{ backgroundColor: '#f5f5f5' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled style={{ backgroundColor: '#f5f5f5' }} />
              </div>
              <div className="form-group">
                <label>CPF</label>
                <input type="text" value={user.cpf} disabled style={{ backgroundColor: '#f5f5f5' }} />
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="modal-section">
            <h3>Permissões e funções</h3>
            <label className="checkbox-group">
              <input
                type="checkbox"
                checked={formData.is_active || false}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                disabled={loading}
              />
              <span>Usuário ativo</span>
            </label>
            <label className="checkbox-group">
              <input
                type="checkbox"
                checked={formData.is_authorized || false}
                onChange={(e) => handleChange('is_authorized', e.target.checked)}
                disabled={loading}
              />
              <span>Autorizado a acessar</span>
            </label>
            <label className="checkbox-group">
              <input
                type="checkbox"
                checked={formData.role === 'admin'}
                onChange={(e) => handleChange('role', e.target.checked ? 'admin' : 'investor')}
                disabled={loading}
              />
              <span>Administrador</span>
            </label>
          </div>

          {/* Units Section */}
          <div className="modal-section">
            <h3>Unidades associadas</h3>
            <div className="unit-checklist">
              {units.map((unit) => (
                <label key={unit.id} className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={formData.unit_ids?.includes(unit.id) || false}
                    onChange={() => handleUnitToggle(unit.id)}
                    disabled={loading}
                  />
                  <span>{unit.nome}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
