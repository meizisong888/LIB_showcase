import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <section className="container not-found"><p className="eyebrow">404 · Not found</p><h1>This workbench drawer is empty.</h1><p>The page may have moved, or the skill slug does not exist.</p><Link className="button" to="/"><ArrowLeft size={17} />Return home</Link></section>
}
