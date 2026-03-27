import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { PortalFile, Unit } from '../../types'

export function InvestorHomePage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [files, setFiles] = useState<PortalFile[]>([])

  useEffect(() => {
    api.get('/investor/units').then((res) => setUnits(res.data)).catch(() => setUnits([
      { id: 1, nome: 'alameda', endereco: '', cidade: '', estado: '', status_texto: 'Unidade inaugurada' },
      { id: 2, nome: 'Rio Branco', endereco: '', cidade: '', estado: '', status_texto: 'Unidade inaugurada' },
    ]))
    api.get('/files').then((res) => setFiles(res.data)).catch(() => setFiles([
      { id: 1, titulo: 'DRE - FEVEREIRO 2026', tipo_arquivo: 'DRE', mes_referencia: 'Fevereiro', ano_referencia: 2026, unit_names: ['alameda'] },
      { id: 2, titulo: 'DRE - FEVEREIRO 2026', tipo_arquivo: 'DRE', mes_referencia: 'Fevereiro', ano_referencia: 2026, unit_names: ['Rio Branco'] },
    ]))
  }, [])

  return (
    <div>
      <div className="hero-banner compact">
        <div>
          <h2>Portal do Investidor</h2>
          <p>Suas unidades e arquivos liberados.</p>
        </div>
      </div>
      <div className="investor-grid">
        <div className="table-card">
          <h3>Minhas unidades</h3>
          {units.map((unit) => (
            <div className="investor-unit-item" key={unit.id}>{unit.nome}</div>
          ))}
        </div>
        <div className="table-card">
          <h3>Arquivos disponíveis</h3>
          {files.map((file) => (
            <div className="investor-file-item" key={file.id}>
              <div>
                <strong>{file.titulo}</strong>
                <span>{file.unit_names.join(', ')} • {file.mes_referencia}</span>
              </div>
              <button className="outline-soft small">Baixar PDF</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
