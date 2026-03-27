import { User, Unit } from '../../types'

export function UserEditModal({ user, units }: { user: User; units: Unit[] }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Editar usuário</h2>
          <span>×</span>
        </div>
        <div className="modal-grid">
          <div className="photo-placeholder" />
          <div>
            <label>Nome</label>
            <input value={user.nome} readOnly />
            <div className="row-inline">
              <input value={user.cpf} readOnly />
              <button className="square-button">✓</button>
            </div>
            <label className="checkbox-row"><input type="checkbox" checked={user.is_authorized} readOnly /> Este usuário está autorizado?</label>
            <label className="checkbox-row"><input type="checkbox" checked={user.role === 'admin'} readOnly /> Este usuário é um administrador?</label>
          </div>
        </div>
        <h3>Unidades</h3>
        <div className="unit-chip-list">
          {units.slice(0, 5).map((unit) => (
            <div key={unit.id} className="unit-chip">
              <span className="mini-avatar">EV</span>
              <span>{unit.nome}</span>
              <input type="checkbox" checked={user.unit_ids.includes(unit.id)} readOnly />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
