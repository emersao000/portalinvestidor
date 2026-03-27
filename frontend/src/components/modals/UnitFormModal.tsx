import { useState } from 'react'
import { Unit } from '../../types'

interface UnitFormModalProps {
  unit?: Unit
  onClose: () => void
  onSubmit: (data: Partial<Unit>) => Promise<void>
}

export function UnitFormModal({ unit, onClose, onSubmit }: UnitFormModalProps) {
  const [formData, setFormData] = useState<Partial<Unit>>({
    nome: unit?.nome || '',
    endereco: unit?.endereco || '',
    cidade: unit?.cidade || '',
    estado: unit?.estado || '',
    status_texto: unit?.status_texto || 'Unidade inaugurada',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome?.trim()) {
      setError('Nome da unidade é obrigatório')
      return
    }
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar unidade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{unit ? 'Editar unidade' : 'Cadastrar unidade'}</h2>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nome da unidade *</label>
            <input
              type="text"
              value={formData.nome || ''}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Ipiranga - Clube"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              value={formData.endereco || ''}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Ex: Rua do Ipiranga, 100"
              disabled={loading}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                value={formData.cidade || ''}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Ex: São Paulo"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <input
                type="text"
                value={formData.estado || ''}
                onChange={(e) => handleChange('estado', e.target.value)}
                placeholder="Ex: SP"
                maxLength={2}
                disabled={loading}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status_texto || 'Unidade inaugurada'}
              onChange={(e) => handleChange('status_texto', e.target.value)}
              disabled={loading}
            >
              <option value="Unidade inaugurada">Unidade inaugurada</option>
              <option value="Unidade a inaugurar">Unidade a inaugurar</option>
              <option value="Unidade em construção">Unidade em construção</option>
            </select>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
