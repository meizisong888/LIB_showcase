import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotFoundPage } from './pages/NotFoundPage'
import { RecommendPage } from './pages/RecommendPage'
import { ToolsPage } from './pages/ToolsPage'

export default function App() {
  return <Routes><Route element={<Layout />}>
    <Route path="/" element={<Navigate to="/recommend" replace />} />
    <Route path="/recommend" element={<RecommendPage />} />
    <Route path="/tools" element={<ToolsPage />} />
    <Route path="/responsible-use" element={<Navigate to="/recommend" replace />} />
    <Route path="/safety" element={<Navigate to="/recommend" replace />} />
    <Route path="/methodology" element={<Navigate to="/recommend" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>
}
