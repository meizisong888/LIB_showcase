import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { WorkflowMap } from '../components/WorkflowMap'
import { tasks } from '../data/tasks'
import { ui } from '../i18n/en'

export function HomePage() {
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><Sparkles size={16} aria-hidden="true" />{ui.home.eyebrow}</p><h1>{ui.home.title}</h1><p>{ui.home.description}</p><div className="hero-actions"><Link to="/recommend" className="button">Build a recommendation <ArrowRight size={18} /></Link><Link to="/tools" className="text-link">Review verified tools <ArrowRight size={16} /></Link></div><div className="trust-row" aria-label="Project scope"><span>5 core student tools</span><span>1 ARC-account option</span><span>VT sources only</span></div></div><aside className="hero-panel"><p className="panel-kicker">What this guide will—and will not—do</p><h2>Verified VT access is the entry ticket.</h2><p>Popularity, a consumer free tier, or independent student registration is never enough for inclusion.</p><ul className="boundary-list"><li>Student eligibility is checked first.</li><li>Export-controlled data and CUI always stop.</li><li>No match means no external fallback.</li></ul><Link className="panel-footer-link" to="/responsible-use">See the evidence boundary <ArrowRight size={16} /></Link></aside></div></section>

    <section className="section container"><div className="section-heading"><p className="eyebrow">Choose a starting task</p><h2>What do you need to do?</h2><p>Opening a task preselects one of ten distinct goals. You will see only the file, source, web, citation, code, API, media, image, data, and ARC questions relevant to that goal.</p></div><div className="task-grid">{tasks.map((task, index) => <Link className="task-card" key={task.id} to={`/recommend?goal=${task.id}`}><span className="task-number">{String(index + 1).padStart(2, '0')}</span><h3>{task.shortName}</h3><p>{task.summary}</p><span className="card-link">Check VT-supported fits <ArrowRight size={15} /></span></Link>)}</div></section>

    <section className="section container"><WorkflowMap /></section>

    <section className="container home-safety"><ShieldAlert aria-hidden="true" /><div><p className="eyebrow">A firm stop rule</p><h2>Never enter export-controlled data or CUI into an AI tool.</h2><p>Virginia Tech states that these categories are not authorized for any AI tool, including tools otherwise approved for high-risk data.</p></div><Link to="/responsible-use" className="button button-light">Review responsible use <ArrowRight size={18} /></Link></section>

    <section className="section container review-strip"><div><span className="status-dot" />Official information checked <strong>{ui.dates.currentReview}</strong></div><p>Access and policy can change. Every tool card links directly to the VT or ARC evidence used.</p><a href="https://ai.vt.edu/tools.html" target="_blank" rel="noreferrer">Open VT source <ArrowRight size={16} /></a></section>
  </>
}
