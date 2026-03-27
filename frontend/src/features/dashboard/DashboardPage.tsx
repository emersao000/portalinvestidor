import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Summary } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { StatCard } from '../../components/ui/StatCard'

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary>({ uploads: 303, units: 46, users: 155 })

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setSummary(res.data)).catch(() => undefined)
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
        {[
          ['DRE - FEVEREIRO 2026', 'alameda', 'DRE', 'Fevereiro'],
          ['DRE - FEVEREIRO 2026', 'Rio Branco', 'DRE', 'Fevereiro'],
          ['DRE - FEVEREIRO 2026', 'RUI BARBOSA', 'DRE', 'Fevereiro'],
        ].map((row) => (
          <div className="file-row" key={row.join('-')}>
            <span className="file-icon">▣</span>
            <span>{row[0]}</span>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
            <span>{row[3]}</span>
            <span>⇩</span>
          </div>
        ))}
      </div>
    </div>
  )
}
