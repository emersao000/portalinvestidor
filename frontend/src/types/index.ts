export type Summary = { uploads: number; units: number; users: number }
export type Unit = { id: number; nome: string; endereco: string; cidade: string; estado: string; status_texto: string }
export type User = { id: number; nome: string; email: string; cpf: string; role: string; is_active: boolean; is_authorized: boolean; unit_ids: number[] }
export type PortalFile = { id: number; titulo: string; tipo_arquivo: string; mes_referencia: string; ano_referencia: number; unit_names: string[] }
