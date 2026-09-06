import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <section className="container not-found"><p className="eyebrow">404 · Not found</p><h1>This page is outside the current student-tool guide.</h1><p>The project now focuses on the task recommender, verified VT tools, and responsible-use sources.</p><Link className="button" to="/"><ArrowLeft size={17} />Return home</Link></section>
}
