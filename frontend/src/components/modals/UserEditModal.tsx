import { useMemo, useState } from 'react'
import { User, Unit } from '../../types'
import { MultiSelectDropdown } from '../ui/MultiSelectDropdown'

interface UserEditModalProps {
  user: User
  units: Unit[]
  onClose: () => void
  onSubmit: (data: Partial<User>) => Promise<void>
  onResetPassword: (mustChangePassword: boolean) => Promise<void>
}

export function UserEditModal({ user, units, onClose, onSubmit, onResetPassword }: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    is_authorized: user.is_authorized,
    role: user.role,
    is_active: user.is_active,
    telefone: user.telefone,
    sobrenome: user.sobrenome,
    must_change_password: user.must_change_password,
    unit_ids: user.unit_ids,
  })
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState('')

  const unitOptions = useMemo(
    () => units.map((unit) => ({ id: unit.id, label: unit.nome, hint: [unit.cidade, unit.estado].filter(Boolean).join(' • ') })),
    [units]
  )

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
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

  const handleResetPassword = async () => {
    setResetLoading(true)
    setError('')
    try {
      await onResetPassword(!!formData.must_change_password)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao resetar a senha')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Editar investidor</h2>
            <p className="modal-subtitle">Atualize permissões, unidades, bloqueio e reset de senha.</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-section">
            <h3>Informações do usuário</h3>
            <div className="form-grid two-columns">
              <div className="form-group">
                <label>Nome</label>
                <input type="text" value={user.nome} disabled className="input-disabled" />
              </div>
              <div className="form-group">
                <label>Sobrenome</label>
                <input type="text" value={formData.sobrenome || ''} onChange={(e) => handleChange('sobrenome', e.target.value)} />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" value={user.email} disabled className="input-disabled" />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input type="text" value={formData.telefone || ''} onChange={(e) => handleChange('telefone', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3>Permissões e status</h3>
            <div className="toggle-grid">
              <label className="setting-toggle">
                <input type="checkbox" checked={formData.is_active || false} onChange={(e) => handleChange('is_active', e.target.checked)} disabled={loading} />
                <div><strong>Usuário ativo</strong><span>Permite login e navegação no portal.</span></div>
              </label>
              <label className="setting-toggle">
                <input type="checkbox" checked={formData.is_authorized || false} onChange={(e) => handleChange('is_authorized', e.target.checked)} disabled={loading} />
                <div><strong>Acesso autorizado</strong><span>Libera unidades e arquivos do investidor.</span></div>
              </label>
              <label className="setting-toggle">
                <input type="checkbox" checked={formData.role === 'admin'} onChange={(e) => handleChange('role', e.target.checked ? 'admin' : 'investor')} disabled={loading} />
                <div><strong>Administrador</strong><span>Concede permissões administrativas completas.</span></div>
              </label>
              <label className="setting-toggle">
                <input type="checkbox" checked={formData.must_change_password || false} onChange={(e) => handleChange('must_change_password', e.target.checked)} disabled={loading || resetLoading} />
                <div><strong>Trocar senha no próximo login</strong><span>Usado também no reset de senha abaixo.</span></div>
              </label>
            </div>
          </div>

          <div className="modal-section">
            <h3>Unidades de sócio investidor</h3>
            <MultiSelectDropdown
              label="Selecionar unidades"
              options={unitOptions}
              selected={formData.unit_ids || []}
              onChange={(next) => handleChange('unit_ids', next)}
              placeholder="Clique para selecionar múltiplas unidades"
            />
          </div>

          <div className="modal-section reset-password-panel">
            <div>
              <h3>Reset de senha</h3>
              <p className="modal-subtitle">Gera uma nova senha temporária de 6 caracteres e permite exigir troca no primeiro acesso.</p>
            </div>
            <button type="button" className="btn-secondary" onClick={handleResetPassword} disabled={resetLoading}>{resetLoading ? 'Resetando...' : 'Resetar senha'}</button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading || resetLoading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading || resetLoading}>{loading ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
