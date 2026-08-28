import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ContributePage } from './pages/ContributePage'
import { FindSkillPage } from './pages/FindSkillPage'
import { HomePage } from './pages/HomePage'
import { MethodologyPage } from './pages/MethodologyPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RecommendPage } from './pages/RecommendPage'
import { SafetyPage } from './pages/SafetyPage'
import { SkillDetailPage } from './pages/SkillDetailPage'
import { SkillsPage } from './pages/SkillsPage'
import { ToolsPage } from './pages/ToolsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommend" element={<RecommendPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/:slug" element={<SkillDetailPage />} />
        <Route path="/find-a-skill" element={<FindSkillPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/contribute" element={<ContributePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
