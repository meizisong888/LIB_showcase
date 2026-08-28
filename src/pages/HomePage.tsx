import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScenarioExplorer } from '../components/ScenarioExplorer'
import { WorkflowMap } from '../components/WorkflowMap'
import { ui } from '../i18n/en'

const concepts = [
  { term: 'AI product', description: 'The application or service you open. Its account instance and documented features define the boundary.' },
  { term: 'Capability fit', description: 'Strong, capable, conditional, or not focused for a task—never a universal quality score.' },
  { term: 'Workflow skill', description: 'Repeatable steps, a prompt, expected output, failure modes, and human checks.' },
  { term: 'Installable integration', description: 'Software that adds file, account, network, repository, or command permissions.' },
]

export function HomePage() {
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><Sparkles size={16} aria-hidden="true" />{ui.home.eyebrow}</p><h1>{ui.home.title}</h1><p>{ui.home.description}</p><div className="hero-actions"><Link to="/recommend" className="button">Build a recommendation <ArrowRight size={18} /></Link><Link to="/tools" className="text-link">View the capability matrix <ArrowRight size={16} /></Link></div><div className="trust-row" aria-label="Project qualities"><span>8 researched products</span><span>12 reusable skills</span><span>Documented fit—not a ranking</span></div></div><aside className="hero-panel"><p className="panel-kicker">A recommendation answers five questions</p><ol className="hero-question-list"><li>What is the task?</li><li>What constraints apply?</li><li>Which product has the documented capabilities?</li><li>Which skill makes the work repeatable?</li><li>What must a human verify?</li></ol><Link className="panel-footer-link" to="/methodology">Read the transparent method <ArrowRight size={16} /></Link></aside></div></section>

    <section className="section container"><WorkflowMap /></section>
    <section className="section container"><ScenarioExplorer /></section>

    <section className="section container concept-section"><div className="section-heading split-heading"><div><p className="eyebrow">Use precise language</p><h2>Four layers, four different decisions</h2></div><p>A capable product still needs a safe account, a task-specific workflow, and accountable human judgment.</p></div><dl className="concept-grid">{concepts.map((concept, index) => <div key={concept.term}><dt><span>0{index + 1}</span>{concept.term}</dt><dd>{concept.description}</dd></div>)}</dl></section>

    <section className="container home-safety"><ShieldAlert aria-hidden="true" /><div><p className="eyebrow">Data safety comes first</p><h2>If you cannot classify it, do not upload it.</h2><p>FERPA records, personal information, unpublished research, human-subject data, contracts, and export-controlled material can require protections beyond an ordinary account.</p></div><Link to="/safety" className="button button-light">Use the data decision tree <ArrowRight size={18} /></Link></section>

    <section className="section container review-strip"><div><span className="status-dot" />Content reviewed <strong>{ui.dates.currentReview}</strong></div><p>Capabilities, access, and policies change. Each profile links to the evidence used for this review.</p><Link to="/methodology">Review sources <ArrowRight size={16} /></Link></section>
  </>
}
