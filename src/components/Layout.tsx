import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ui } from '../i18n/en'
import { VT_TOOLS_URL } from '../config'

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to main content</a>
      <header className="site-header">
        <div className="nav-wrap">
          <Link to="/recommend" className="brand" aria-label={`${ui.projectName} home`}>
            <span className="brand-mark" aria-hidden="true">VT</span><span>{ui.projectName}</span>
          </Link>
          <button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((value) => !value)}>
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav id="primary-navigation" className={open ? 'primary-nav is-open' : 'primary-nav'} aria-label="Primary navigation">
            <NavLink to="/recommend" onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : undefined}>{ui.nav.recommend}</NavLink>
            <a href={VT_TOOLS_URL} onClick={() => setOpen(false)}>{ui.nav.tools}</a>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-grid">
          <div><Link to="/recommend" className="brand footer-brand"><span className="brand-mark" aria-hidden="true">VT</span><span>{ui.projectName}</span></Link><p>{ui.description}</p></div>
          <div><h2>Use the guide</h2><Link to="/recommend">Task Recommender</Link><a href={VT_TOOLS_URL}>VT AI Tools</a></div>
          <div><h2>Official information</h2><a href="https://ai.vt.edu/tools.html" target="_blank" rel="noreferrer">VT AI Tools ↗</a><a href="https://ai.vt.edu/tools/hokieai.html" target="_blank" rel="noreferrer">HokieAI ↗</a><a href="https://docs.arc.vt.edu/ai/010_llm_arc_vt_edu.html" target="_blank" rel="noreferrer">ARC LLM docs ↗</a></div>
        </div>
        <div className="footer-bottom"><span>Official information last verified {ui.dates.currentReview}</span><span>Browser-only · No uploads · No model API calls</span></div>
      </footer>
    </div>
  )
}
