import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import ToolPage from './pages/ToolPage/ToolPage'
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
              <Route path="/tools/:toolSlug" element={<ToolPage />} />
            </Routes>
          </Suspense>
        </Layout>
        <CookieConsent />
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
