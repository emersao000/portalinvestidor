import { useEffect, useMemo, useState } from 'react'
import { Download, FilePenLine, FolderUp, PencilLine, Search, Trash2 } from 'lucide-react'
import api from '../../lib/api'
import { PortalFile, Unit, User } from '../../types'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { UnitFormModal } from '../../components/modals/UnitFormModal'
import { Pagination } from '../../components/ui/Pagination'

const ITEMS_PER_PAGE = 10
const currentYear = new Date().getFullYear()

function UnitFilesModal({
  unit,
  files,
  onClose,
  onRefresh,
}: {
  unit: Unit
  files: PortalFile[]
  onClose: () => void
  onRefresh: () => Promise<void>
}) {
  const [titulo, setTitulo] = useState('')
  const [tipoArquivo, setTipoArquivo] = useState('Gastos')
  const [mesReferencia, setMesReferencia] = useState('')
  const [anoReferencia, setAnoReferencia] = useState(String(currentYear))
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Selecione um PDF para enviar.')
      return
    }
    const formData = new FormData()
    formData.append('titulo', titulo || selectedFile.name.replace(/\.pdf$/i, ''))
    formData.append('tipo_arquivo', tipoArquivo)
    formData.append('mes_referencia', mesReferencia)
    formData.append('ano_referencia', anoReferencia)
    formData.append('upload', selectedFile)

    setSubmitting(true)
    setError('')
    try {
      await api.post(`/units/${unit.id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setTitulo('')
      setMesReferencia('')
      setAnoReferencia(String(currentYear))
      setSelectedFile(null)
      await onRefresh()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Não foi possível enviar o PDF.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    if (!window.confirm('Excluir este PDF desta unidade?')) return
    await api.delete(`/files/${fileId}`)
    await onRefresh()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Arquivos da unidade</h2>
            <p className="modal-subtitle">{unit.nome}</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>

        <form className="modal-form" onSubmit={handleUpload}>
          <div className="modal-section">
            <h3>Enviar PDF de gastos</h3>
            <div className="form-grid two-columns">
              <div className="form-group">
                <label>Título</label>
                <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Gastos operacionais" />
              </div>
              <div className="form-group">
                <label>Tipo do arquivo</label>
                <input value={tipoArquivo} onChange={(e) => setTipoArquivo(e.target.value)} placeholder="Ex: DRE, NF, Gastos" />
              </div>
              <div className="form-group">
                <label>Mês de referência</label>
                <input value={mesReferencia} onChange={(e) => setMesReferencia(e.target.value)} placeholder="Ex: Março" required />
              </div>
              <div className="form-group">
                <label>Ano</label>
                <input value={anoReferencia} onChange={(e) => setAnoReferencia(e.target.value)} placeholder="2026" required />
              </div>
              <div className="form-group full-width">
                <label>PDF</label>
                <input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} required />
              </div>
            </div>
            {error ? <div className="form-error">{error}</div> : null}
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar PDF'}</button>
            </div>
          </div>

          <div className="modal-section">
            <h3>PDFs cadastrados</h3>
            {files.length === 0 ? <div className="empty-users-state compact">Nenhum PDF enviado para esta unidade.</div> : null}
            <div className="unit-file-list">
              {files.map((file) => (
                <div className="unit-file-row" key={file.id}>
                  <div>
                    <strong>{file.titulo}</strong>
                    <span>{file.tipo_arquivo} • {file.mes_referencia}/{file.ano_referencia}</span>
                  </div>
                  <div className="unit-inline-actions">
                    <a className="action-chip primary icon-action-chip" href={`${api.defaults.baseURL}/files/${file.id}/download`} target="_blank" rel="noreferrer"><Download size={16} /> Baixar</a>
                    <button type="button" className="action-chip danger icon-action-chip" onClick={() => handleDeleteFile(file.id)}><Trash2 size={16} /> Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function UnitUsersModal({
  unit,
  users,
  onClose,
}: {
  unit: Unit
  users: User[]
  onClose: () => void
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Investidores associados</h2>
            <p className="modal-subtitle">{unit.nome}</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>

        <div className="unit-user-list">
          {users.length === 0 ? <div className="empty-users-state compact">Nenhum usuário vinculado a esta unidade.</div> : null}
          {users.map((user) => (
            <div className="unit-user-row" key={user.id}>
              <div className="mini-avatar">{user.nome[0]}</div>
              <div>
                <strong>{user.nome} {user.sobrenome || ''}</strong>
                <span>{user.email}</span>
              </div>
              <div className="pill-status ok">{user.role === 'admin' ? 'Administrador' : 'Investidor'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUnitForFiles, setSelectedUnitForFiles] = useState<Unit | null>(null)
  const [selectedUnitForUsers, setSelectedUnitForUsers] = useState<Unit | null>(null)
  const [unitFiles, setUnitFiles] = useState<PortalFile[]>([])
  const [unitUsers, setUnitUsers] = useState<User[]>([])

  const loadUnits = async () => {
    try {
      const res = await api.get('/units')
      setUnits(Array.isArray(res.data) ? res.data : [])
    } catch {
      setUnits([])
    }
  }

  useEffect(() => {
    void loadUnits()
  }, [])

  const filteredUnits = useMemo(() => units.filter((unit) =>
    unit.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  ), [units, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / ITEMS_PER_PAGE))
  const paginatedUnits = filteredUnits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleOpenCreateModal = () => {
    setEditingUnit(undefined)
    setShowModal(true)
  }

  const handleOpenEditModal = (unit: Unit) => {
    setEditingUnit(unit)
    setShowModal(true)
  }

  const handleSubmit = async (data: Partial<Unit>) => {
    if (editingUnit) {
      await api.patch(`/units/${editingUnit.id}`, data)
    } else {
      await api.post('/units', data)
    }
    await loadUnits()
  }

  const handleDelete = async (unitId: number) => {
    if (!window.confirm('Tem certeza que deseja deletar esta unidade?')) return
    await api.delete(`/units/${unitId}`)
    await loadUnits()
  }

  const openUnitFiles = async (unit: Unit) => {
    const res = await api.get(`/units/${unit.id}/files`)
    setUnitFiles(Array.isArray(res.data) ? res.data : [])
    setSelectedUnitForFiles(unit)
  }

  const refreshUnitFiles = async () => {
    if (!selectedUnitForFiles) return
    const res = await api.get(`/units/${selectedUnitForFiles.id}/files`)
    setUnitFiles(Array.isArray(res.data) ? res.data : [])
  }

  const openUnitUsers = async (unit: Unit) => {
    const res = await api.get(`/units/${unit.id}/users`)
    setUnitUsers(Array.isArray(res.data) ? res.data : [])
    setSelectedUnitForUsers(unit)
  }

  return (
    <div>
      <SectionHeader
        title="Unidades"
        action={
          <div className="header-actions">
            <button className="outline-soft">Exportar</button>
            <button className="outline-soft" onClick={handleOpenCreateModal}>+ Cadastrar unidade</button>
          </div>
        }
      />
      <div className="search-bar">
        <input
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
        <button type="button"><Search size={18} /></button>
      </div>
      <div className="list-stack">
        {paginatedUnits.map((unit) => (
          <div className="unit-card unit-card-rich" key={unit.id}>
            <div className="unit-photo">
              {unit.foto_url ? <img src={unit.foto_url} alt={unit.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'SEM FOTO'}
            </div>
            <div className="unit-info">
              <strong>{unit.nome}</strong>
              <p>{[unit.endereco, unit.cidade, unit.estado].filter(Boolean).join(' - ') || 'Endereço não informado'}</p>
              <span>{unit.status_texto}</span>
            </div>
            <div className="unit-actions rich">
              <button onClick={() => openUnitFiles(unit)} title="Upload e PDFs" className="icon-square-btn"><FolderUp size={18} /></button>
              <button onClick={() => openUnitUsers(unit)} title="Investidores associados" className="icon-square-btn"><FilePenLine size={18} /></button>
              <button onClick={() => handleOpenEditModal(unit)} title="Editar" className="icon-square-btn"><PencilLine size={18} /></button>
              <button onClick={() => handleDelete(unit.id)} title="Deletar" className="icon-square-btn"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
      {filteredUnits.length > 0 ? (
        <>
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '16px' }}>
            Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredUnits.length)} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredUnits.length)} de {filteredUnits.length} unidades
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}
      {showModal ? <UnitFormModal unit={editingUnit} onClose={() => setShowModal(false)} onSubmit={handleSubmit} /> : null}
      {selectedUnitForFiles ? <UnitFilesModal unit={selectedUnitForFiles} files={unitFiles} onClose={() => setSelectedUnitForFiles(null)} onRefresh={refreshUnitFiles} /> : null}
      {selectedUnitForUsers ? <UnitUsersModal unit={selectedUnitForUsers} users={unitUsers} onClose={() => setSelectedUnitForUsers(null)} /> : null}
    </div>
  )
}
