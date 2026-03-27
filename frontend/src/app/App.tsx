import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { UnitsPage } from '../features/units/UnitsPage'
import { FilesPage } from '../features/files/FilesPage'
import { UsersPage } from '../features/users/UsersPage'
import { InvestorHomePage } from '../features/investor/InvestorHomePage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/unidades" element={<UnitsPage />} />
        <Route path="/arquivos" element={<FilesPage />} />
        <Route path="/investidor" element={<InvestorHomePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
