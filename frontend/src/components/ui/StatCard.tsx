export function StatCard({ title, value, accent = 'orange' }: { title: string; value: number; accent?: 'orange' | 'dark' }) {
  return (
    <div className={`stat-card ${accent}`}>
      <div className="stat-icon">□</div>
      <div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
      <button>Ver todos</button>
    </div>
  )
}
