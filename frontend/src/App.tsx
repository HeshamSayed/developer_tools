import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import ToolPage from './pages/ToolPage/ToolPage'
import About from './pages/About/About'
import PrivacyPolicy from './pages/Legal/PrivacyPolicy'
import TermsOfService from './pages/Legal/TermsOfService'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import TeamsList from './pages/Teams'
import TeamDashboard from './pages/Team'
import Pricing from './pages/Pricing'
import AIAssistantPage from './pages/AIAssistant/AIAssistantPage'
import MockAPIWorkspace from './pages/MockAPI/MockAPIWorkspace'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { NotificationProvider } from './contexts/NotificationContext'
import ErrorBoundary from './components/Common/ErrorBoundary'
import Loading from './components/Common/Loading'
import CookieConsent from './components/Common/CookieConsent'

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Layout>
          <Suspense fallback={<Loading size="lg" text="Loading..." fullScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/tools/:toolSlug"
                element={
                  <ProtectedRoute>
                    <ToolPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <TeamsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/:teamId"
                element={
                  <ProtectedRoute>
                    <TeamDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AIAssistantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock-api"
                element={
                  <ProtectedRoute>
                    <MockAPIWorkspace />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </Layout>
        <CookieConsent />
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
