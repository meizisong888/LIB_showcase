import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RecommendPage } from './pages/RecommendPage'
import { ResponsibleUsePage } from './pages/ResponsibleUsePage'
import { ToolsPage } from './pages/ToolsPage'

export default function App() {
  return <Routes><Route element={<Layout />}><Route path="/" element={<HomePage />} /><Route path="/recommend" element={<RecommendPage />} /><Route path="/tools" element={<ToolsPage />} /><Route path="/responsible-use" element={<ResponsibleUsePage />} /><Route path="/safety" element={<Navigate to="/responsible-use" replace />} /><Route path="/methodology" element={<Navigate to="/responsible-use" replace />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>
}
