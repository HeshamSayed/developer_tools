import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import ToolPage from './pages/ToolPage/ToolPage'
import { NotificationProvider } from './contexts/NotificationContext'

function App() {
  return (
    <NotificationProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/:toolSlug" element={<ToolPage />} />
        </Routes>
      </Layout>
    </NotificationProvider>
  )
}

export default App
