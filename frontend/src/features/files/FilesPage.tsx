import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { PortalFile } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'

export function FilesPage() {
  const [files, setFiles] = useState<PortalFile[]>([])

  useEffect(() => {
    api.get('/files').then((res) => setFiles(res.data)).catch(() => setFiles([]))
  }, [])

  return (
    <div>
      <SectionHeader title="Arquivos" action={<button className="outline-soft">Exportar</button>} />
      <div className="filters-grid">
        <div className="filter-box">Unidades ▾ ✕</div>
        <div className="filter-box">Tipo de arquivo ▾ ✕</div>
        <div className="filter-box">Mês referência ▾ ✕</div>
      </div>
      <div className="table-card flat">
        {files.map((file) => (
          <div className="file-row files-page" key={file.id}>
            <span className="file-icon">▣</span>
            <span>{file.titulo}</span>
            <span>{file.unit_names.join(', ')}</span>
            <span>{file.tipo_arquivo}</span>
            <span>{file.mes_referencia}</span>
            <span>✎ ⇩ 🗑</span>
          </div>
        ))}
      </div>
    </div>
  )
}
