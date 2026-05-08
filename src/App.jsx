import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

import LoginPage        from './pages/auth/LoginPage'
import RegisterPage     from './pages/auth/RegisterPage'
import ForgotPassword   from './pages/auth/ForgotPassword'
import ResetPassword    from './pages/auth/ResetPassword'
import PrivacyPolicy    from './pages/PrivacyPolicy'
import TermsOfService   from './pages/TermsOfService'
import Dashboard        from './pages/Dashboard'
import Tasks            from './pages/Tasks'
import Contacts         from './pages/Contacts'
import Chat             from './pages/Chat'
import Email            from './pages/Email'
import CalendarPage     from './pages/CalendarPage'
import SettingsPage     from './pages/SettingsPage'
import Reminders       from './pages/Reminders'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token } = useAuth()
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password"  element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/privacy"         element={<PrivacyPolicy />} />
            <Route path="/terms"           element={<TermsOfService />} />
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks"     element={<Tasks />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/contacts"  element={<Contacts />} />
              <Route path="/chat"      element={<Chat />} />
              <Route path="/email"     element={<Email />} />
              <Route path="/calendar"  element={<CalendarPage />} />
              <Route path="/settings"  element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}
