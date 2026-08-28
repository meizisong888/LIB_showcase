import { Menu, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ui } from '../i18n/en'

const navItems = [
  { to: '/recommend', label: ui.nav.recommend },
  { to: '/tools', label: ui.nav.tools },
  { to: '/skills', label: ui.nav.skills },
  { to: '/safety', label: ui.nav.safety },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="site-shell">
      <div className="disclaimer-bar">
        <ShieldCheck size={15} aria-hidden="true" />
        <span>{ui.disclaimer}</span>
      </div>
      <header className="site-header">
        <div className="nav-wrap">
          <Link to="/" className="brand" aria-label={`${ui.projectName} home`} onClick={() => setOpen(false)}>
            <span className="brand-mark">AI</span>
            <span>{ui.projectName}</span>
          </Link>
          <button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((value) => !value)}>
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav id="primary-navigation" className={open ? 'primary-nav is-open' : 'primary-nav'} aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : undefined}>{item.label}</NavLink>
            ))}
          </nav>
          <Link to="/recommend" className="button button-small header-cta">Find your fit</Link>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand footer-brand"><span className="brand-mark">AI</span><span>{ui.projectName}</span></Link>
            <p>A task-first, evidence-aware guide for choosing AI tools and repeatable workflows.</p>
            <p className="fine-print">{ui.disclaimer}</p>
          </div>
          <div>
            <h2>Explore</h2>
            <Link to="/recommend">Task finder</Link>
            <Link to="/tools">Compare tools</Link>
            <Link to="/skills">Skills library</Link>
            <Link to="/find-a-skill">Evaluate a skill</Link>
          </div>
          <div>
            <h2>Trust</h2>
            <Link to="/safety">Responsible AI</Link>
            <Link to="/methodology">Methodology & sources</Link>
            <Link to="/contribute">Contribute</Link>
            <a href="https://ai.vt.edu/tools.html" target="_blank" rel="noreferrer">VT approved tools ↗</a>
          </div>
        </div>
        <div className="footer-bottom"><span>Capstone MVP · Content reviewed {ui.dates.currentReview}</span><span>No accounts · No uploads · No model API calls</span></div>
      </footer>
    </div>
  )
}
