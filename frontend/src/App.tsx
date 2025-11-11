import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import ToolPage from './pages/ToolPage/ToolPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/:toolSlug" element={<ToolPage />} />
      </Routes>
    </Layout>
  )
}

export default App
