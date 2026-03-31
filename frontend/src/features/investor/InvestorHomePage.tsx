import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Download, FileText, MapPin } from 'lucide-react'
import api from '../../lib/api'
import { PortalFile, Unit } from '../../types'

export function InvestorHomePage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [expandedUnitId, setExpandedUnitId] = useState<number | null>(null)
  const [filesByUnit, setFilesByUnit] = useState<Record<number, PortalFile[]>>({})
  const [loadingUnitId, setLoadingUnitId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  async function handleDownload(file: PortalFile) {
    setDownloadingId(file.id)
    try {
      const response = await api.get(`/files/${file.id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.nome_arquivo || `arquivo_${file.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao baixar o arquivo.')
    } finally {
      setDownloadingId(null)
    }
  }

  useEffect(() => {
    api.get('/investor/units').then((res) => {
      const nextUnits = Array.isArray(res.data) ? res.data : []
      setUnits(nextUnits)
      if (nextUnits.length > 0) {
        setExpandedUnitId(nextUnits[0].id)
        void loadUnitFiles(nextUnits[0].id)
      }
    }).catch(() => setUnits([]))
  }, [])

  const loadUnitFiles = async (unitId: number) => {
    if (filesByUnit[unitId]) return
    setLoadingUnitId(unitId)
    try {
      const res = await api.get(`/units/${unitId}/files`)
      setFilesByUnit((prev) => ({ ...prev, [unitId]: Array.isArray(res.data) ? res.data : [] }))
    } catch {
      setFilesByUnit((prev) => ({ ...prev, [unitId]: [] }))
    } finally {
      setLoadingUnitId(null)
    }
  }

  const toggleUnit = async (unitId: number) => {
    const nextOpen = expandedUnitId === unitId ? null : unitId
    setExpandedUnitId(nextOpen)
    if (nextOpen) {
      await loadUnitFiles(nextOpen)
    }
  }

  return (
    <div>
      <div className="hero-banner compact investor-hero">
        <img
          src="https://images.totalpass.com/public/1280x720/czM6Ly90cC1pbWFnZS1hZG1pbi1wcm9kL2d5bXMvNHVrOWtkOGd3M2xlMXg4OGNzdzViN2NhdmUzY2hhNWV3Y2lyd2pyNmI4djl6aXdiNTV2YXg3bjJ2aDI2"
          alt="Evoque Academia"
          className="investor-hero-logo"
        />
        <div>
          <h2>Portal do Investidor</h2>
          <p>Acompanhe os documentos e relatórios financeiros das suas unidades.</p>
        </div>
      </div>

      <div className="investor-unit-stack investor-accordion-stack">
        {units.map((unit) => {
          const isOpen = expandedUnitId === unit.id
          const unitFiles = filesByUnit[unit.id] || []
          return (
            <div className="table-card investor-accordion-card" key={unit.id}>
              <button type="button" className="investor-unit-trigger" onClick={() => void toggleUnit(unit.id)}>
                <div>
                  <h3>{unit.nome}</h3>
                  <div className="user-mail investor-unit-address"><MapPin size={14} /> {[unit.endereco, unit.cidade, unit.estado].filter(Boolean).join(' • ')}</div>
                </div>
                <div className="investor-unit-trigger-side">
                  <div className="pill-status ok">{unitFiles.length} arquivo(s)</div>
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </button>

              {isOpen ? (
                <div className="investor-unit-content">
                  {loadingUnitId === unit.id ? <div className="empty-users-state compact">Carregando arquivos...</div> : null}
                  {loadingUnitId !== unit.id && unitFiles.length === 0 ? <div className="empty-users-state compact">Nenhum PDF liberado para esta unidade ainda.</div> : null}
                  <div className="unit-file-list">
                    {unitFiles.map((file) => (
                      <div className="unit-file-row" key={file.id}>
                        <div className="file-row-main">
                          <div className="file-row-icon"><FileText size={18} /></div>
                          <div>
                            <strong>{file.titulo}</strong>
                            <span>{file.tipo_arquivo} • {file.mes_referencia}/{file.ano_referencia}</span>
                          </div>
                        </div>
                        <button
                          className="action-chip primary icon-action-chip"
                          onClick={() => handleDownload(file)}
                          disabled={downloadingId === file.id}
                        >
                          <Download size={16} />
                          {downloadingId === file.id ? 'Baixando...' : 'Baixar PDF'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
