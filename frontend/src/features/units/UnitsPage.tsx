import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Unit } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'

export function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])

  useEffect(() => {
    api.get('/units').then((res) => setUnits(res.data)).catch(() => setUnits([
      { id: 1, nome: 'Ipiranga - Clube', endereco: '', cidade: '', estado: '', status_texto: 'Unidade a inaugurar' },
      { id: 2, nome: 'RUI BARBOSA', endereco: 'Rua Hélio de Castro Maia, 410', cidade: 'Campo Grande', estado: 'MS', status_texto: 'Unidade inaugurada' },
      { id: 3, nome: 'Rio Branco', endereco: 'Av. Rio Branco, 1457', cidade: 'São Paulo', estado: 'SP', status_texto: 'Unidade inaugurada' },
    ]))
  }, [])

  return (
    <div>
      <SectionHeader title="Unidades" action={<div className="header-actions"><button className="outline-soft">Exportar</button><button className="outline-soft">+ Cadastrar unidade</button></div>} />
      <div className="search-bar"><input placeholder="Pesquisar" /><button>⌕</button></div>
      <div className="list-stack">
        {units.map((unit) => (
          <div className="unit-card" key={unit.id}>
            <div className="unit-photo">SEM FOTO</div>
            <div className="unit-info">
              <strong>{unit.nome}</strong>
              <p>{[unit.endereco, unit.cidade, unit.estado].filter(Boolean).join(' - ')}</p>
              <span>{unit.status_texto}</span>
            </div>
            <div className="unit-actions">👥 📁 ✎ 🗑</div>
          </div>
        ))}
      </div>
    </div>
  )
}
