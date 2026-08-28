import { ArrowRight, BookOpen, ChartNoAxesCombined, Code2, Files, MessagesSquare, PenLine, Presentation, Search, ShieldAlert, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { tasks } from '../data/tasks'
import { ui } from '../i18n/en'

const taskIcons = { Search, BookOpen, PenLine, Files, Presentation, ChartNoAxesCombined, Code2, MessagesSquare }

const concepts = [
  { term: 'AI tool / product', description: 'The product you open and use—such as a general assistant, research tool, office assistant, or coding agent.' },
  { term: 'Capability', description: 'What a product can do: search, cite, draft, analyze data, edit files, generate code, or work with images.' },
  { term: 'Workflow skill', description: 'A repeatable sequence, prompt, and human checklist for completing a specific task.' },
  { term: 'Installable skill / plugin', description: 'An integration that needs installation, authorization, file access, network access, or command execution.' },
]

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={16} aria-hidden="true" /> {ui.home.eyebrow}</p>
            <h1>{ui.home.title}</h1>
            <p>{ui.home.description}</p>
            <div className="hero-actions">
              <Link to="/recommend" className="button">{ui.actions.start}<ArrowRight size={18} /></Link>
              <Link to="/methodology" className="text-link">See how recommendations work <ArrowRight size={16} /></Link>
            </div>
            <div className="trust-row" aria-label="Project qualities">
              <span>8 researched tools</span><span>12 repeatable skills</span><span>No hidden ranking</span>
            </div>
          </div>
          <div className="hero-panel">
            <p className="panel-kicker">Start here</p>
            <h2>{ui.home.question}</h2>
            <div className="quick-tasks">
              {tasks.slice(0, 4).map((task) => {
                const Icon = taskIcons[task.icon as keyof typeof taskIcons]
                return <Link key={task.id} to={`/recommend?task=${task.id}`}><Icon size={19} /><span>{task.name}</span><ArrowRight size={16} /></Link>
              })}
            </div>
            <Link className="panel-footer-link" to="/recommend">See all tasks <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="task-section section container" aria-labelledby="popular-tasks">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Eight common starting points</p><h2 id="popular-tasks">Begin with the job, not the brand</h2></div>
          <p>Each path asks what evidence, files, ecosystem, access, and human judgment your task actually needs.</p>
        </div>
        <div className="task-grid">
          {tasks.map((task) => {
            const Icon = taskIcons[task.icon as keyof typeof taskIcons]
            return (
              <Link className="task-card" key={task.id} to={`/recommend?task=${task.id}`}>
                <span className="task-icon"><Icon aria-hidden="true" /></span>
                <span className="card-eyebrow">{task.eyebrow}</span>
                <h3>{task.name}</h3>
                <p>{task.summary}</p>
                <span className="card-link">Find a workflow <ArrowRight size={16} /></span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="path-section section">
        <div className="container">
          <div className="section-heading"><p className="eyebrow">Three ways in</p><h2>From uncertainty to a reviewable next step</h2></div>
          <div className="path-grid">
            <article><span className="path-number">01</span><h3>Find the right AI</h3><p>Answer eleven practical questions. See safety exclusions, scoring reasons, alternatives, and a verification checklist.</p><Link to="/recommend">Open task finder <ArrowRight size={16} /></Link></article>
            <article><span className="path-number">02</span><h3>Compare AI tools</h3><p>Search and compare up to three products across capability, ecosystem, access, privacy, and current VT status.</p><Link to="/tools">Compare tools <ArrowRight size={16} /></Link></article>
            <article><span className="path-number">03</span><h3>Browse skills</h3><p>Use a complete workflow card with inputs, steps, a copyable prompt, failure modes, and a human review checklist.</p><Link to="/skills">Browse the library <ArrowRight size={16} /></Link></article>
          </div>
        </div>
      </section>

      <section className="section container concept-section">
        <div className="section-heading split-heading"><div><p className="eyebrow">Use precise language</p><h2>Four things that are easy to mix up</h2></div><p>A product may have many capabilities. A workflow skill can work across several products. An installable integration carries extra permission and supply-chain risk.</p></div>
        <dl className="concept-grid">
          {concepts.map((concept, index) => <div key={concept.term}><dt><span>0{index + 1}</span>{concept.term}</dt><dd>{concept.description}</dd></div>)}
        </dl>
      </section>

      <section className="container home-safety">
        <ShieldAlert aria-hidden="true" />
        <div><p className="eyebrow">Data safety comes first</p><h2>If you cannot classify it, do not upload it.</h2><p>FERPA records, personal information, unpublished research, human-subject data, contracts, and export-controlled material can require specific protections beyond an ordinary account.</p></div>
        <Link to="/safety" className="button button-light">Review data guidance <ArrowRight size={18} /></Link>
      </section>

      <section className="section container review-strip">
        <div><span className="status-dot" />Content reviewed <strong>{ui.dates.currentReview}</strong></div>
        <p>Capabilities, prices, access, and policies change. Every factual profile links to the source used for this review.</p>
        <Link to="/methodology">Review sources <ArrowRight size={16} /></Link>
      </section>
    </>
  )
}
