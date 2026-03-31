import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ProtectedRoute } from '../components/routes/ProtectedRoute'
import { AppShell } from '../components/layout/AppShell'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { ChangePasswordPage } from '../features/auth/ChangePasswordPage'
import { RootPage } from '../features/root/RootPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { UnitsPage } from '../features/units/UnitsPage'
import { FilesPage } from '../features/files/FilesPage'
import { UsersPage } from '../features/users/UsersPage'
import { InvestorHomePage } from '../features/investor/InvestorHomePage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/trocar-senha" element={<ChangePasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RootPage />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute requiredRole="admin">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unidades"
            element={
              <ProtectedRoute requiresAuthorization>
                <UnitsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/arquivos"
            element={
              <ProtectedRoute requiresAuthorization>
                <FilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investidor"
            element={
              <ProtectedRoute requiredRole="investor" requiresAuthorization>
                <InvestorHomePage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
