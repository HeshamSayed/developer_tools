import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import ToolPage from './pages/ToolPage/ToolPage'
import PrivacyPolicy from './pages/Legal/PrivacyPolicy'
import TermsOfService from './pages/Legal/TermsOfService'
import { NotificationProvider } from './contexts/NotificationContext'
import ErrorBoundary from './components/Common/ErrorBoundary'
import Loading from './components/Common/Loading'
import CookieConsent from './components/Common/CookieConsent'
import AutoAds from './components/Ads/AutoAds'
import VignetteAd from './components/Ads/VignetteAd'

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AutoAds />
        <VignetteAd minNavigations={3} autoDismissSeconds={8} />
        <Layout>
          <Suspense fallback={<Loading size="lg" text="Loading..." fullScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tools/:toolSlug" element={<ToolPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </Suspense>
        </Layout>
        <CookieConsent />
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
