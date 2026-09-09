import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <section className="container not-found"><p className="eyebrow">404 · Not found</p><h1>This page could not be found.</h1><p>Choose a task or browse verified VT AI tools.</p><Link className="button" to="/recommend"><ArrowLeft size={17} />Open Task Recommender</Link></section>
}
