import { useNavigate } from 'react-router-dom'

export function StatCard({ title, value, accent = 'orange', href }: { title: string; value: number; accent?: 'orange' | 'dark'; href?: string }) {
  const navigate = useNavigate()
  return (
    <div className={`stat-card ${accent}`}>
      <div className="stat-icon">□</div>
      <div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
      {href ? (
        <button onClick={() => navigate(href)}>Ver todos</button>
      ) : (
        <button>Ver todos</button>
      )}
    </div>
  )
}
