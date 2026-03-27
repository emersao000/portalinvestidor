import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { PortalFile } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { Pagination } from '../../components/ui/Pagination'

const ITEMS_PER_PAGE = 10

export function FilesPage() {
  const [files, setFiles] = useState<PortalFile[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  useEffect(() => {
    api.get('/files').then((res) => setFiles(res.data)).catch(() => setFiles([]))
  }, [])

  const uniqueUnits = Array.from(
    new Set(files.flatMap((f) => f.unit_names))
  ).sort()

  const uniqueTypes = Array.from(
    new Set(files.map((f) => f.tipo_arquivo))
  ).sort()

  const uniqueMonths = Array.from(
    new Set(files.map((f) => f.mes_referencia))
  ).sort()

  const filteredFiles = files.filter((file) => {
    const unitMatch =
      selectedUnit === 'all' || file.unit_names.includes(selectedUnit)
    const typeMatch =
      selectedType === 'all' || file.tipo_arquivo === selectedType
    const monthMatch =
      selectedMonth === 'all' || file.mes_referencia === selectedMonth
    return unitMatch && typeMatch && monthMatch
  })

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE)
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const clearFilters = () => {
    setSelectedUnit('all')
    setSelectedType('all')
    setSelectedMonth('all')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    selectedUnit !== 'all' || selectedType !== 'all' || selectedMonth !== 'all'

  return (
    <div>
      <SectionHeader title="Arquivos" action={<button className="outline-soft">Exportar</button>} />
      <div className="filters-grid">
        <div className="filter-box">
          <select value={selectedUnit} onChange={(e) => {
            setSelectedUnit(e.target.value)
            setCurrentPage(1)
          }}>
            <option value="all">Todas as unidades</option>
            {uniqueUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {selectedUnit !== 'all' && (
            <button onClick={() => {
              setSelectedUnit('all')
              setCurrentPage(1)
            }} className="filter-clear">
              ✕
            </button>
          )}
        </div>
        <div className="filter-box">
          <select value={selectedType} onChange={(e) => {
            setSelectedType(e.target.value)
            setCurrentPage(1)
          }}>
            <option value="all">Todos os tipos</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {selectedType !== 'all' && (
            <button onClick={() => {
              setSelectedType('all')
              setCurrentPage(1)
            }} className="filter-clear">
              ✕
            </button>
          )}
        </div>
        <div className="filter-box">
          <select value={selectedMonth} onChange={(e) => {
            setSelectedMonth(e.target.value)
            setCurrentPage(1)
          }}>
            <option value="all">Todos os meses</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          {selectedMonth !== 'all' && (
            <button onClick={() => {
              setSelectedMonth('all')
              setCurrentPage(1)
            }} className="filter-clear">
              ✕
            </button>
          )}
        </div>
      </div>
      {hasActiveFilters && (
        <div style={{ textAlign: 'right', marginBottom: '12px' }}>
          <button onClick={clearFilters} className="link-button">
            Limpar filtros
          </button>
        </div>
      )}
      {filteredFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          Nenhum arquivo encontrado com os filtros selecionados.
        </div>
      ) : (
        <>
          <div className="table-card flat">
            {paginatedFiles.map((file) => (
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
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '16px' }}>
            Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredFiles.length)} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredFiles.length)} de {filteredFiles.length} arquivos
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
