import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Summary, PortalFile } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { StatCard } from '../../components/ui/StatCard'

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary>({ uploads: 0, units: 0, users: 0 })
  const [recentFiles, setRecentFiles] = useState<PortalFile[]>([])

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setSummary(res.data)).catch(() => undefined)
    api.get('/files').then((res) => setRecentFiles(res.data.slice(0, 3))).catch(() => undefined)
  }, [])

  return (
    <div>
      <div className="hero-banner">
        <div>
          <h2>Bem-vindo</h2>
          <p>ao seu portal do investidor</p>
        </div>
      </div>
      <SectionHeader title="Visão geral" />
      <div className="stats-grid">
        <StatCard title="Upload de arquivos" value={summary.uploads} accent="orange" />
        <StatCard title="Unidades Cadastradas" value={summary.units} accent="dark" />
        <StatCard title="Usuários Cadastrados" value={summary.users} accent="orange" />
      </div>
      <div className="table-card">
        <div className="table-top">
          <h3>Últimos arquivos enviados</h3>
          <a href="/arquivos">Ver todos</a>
        </div>
        {recentFiles.map((file) => (
          <div className="file-row" key={file.id}>
            <span className="file-icon">▣</span>
            <span>{file.titulo}</span>
            <span>{file.unit_names.join(', ')}</span>
            <span>{file.tipo_arquivo}</span>
            <span>{file.mes_referencia}</span>
            <span>⇩</span>
          </div>
        ))}
      </div>
    </div>
  )
}
