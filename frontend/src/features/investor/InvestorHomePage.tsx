import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { PortalFile, Unit } from '../../types'

export function InvestorHomePage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [files, setFiles] = useState<PortalFile[]>([])

  useEffect(() => {
    api.get('/investor/units').then((res) => setUnits(res.data)).catch(() => setUnits([]))
    api.get('/files').then((res) => setFiles(res.data)).catch(() => setFiles([]))
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
