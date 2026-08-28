import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { scenarios } from '../data/scenarios'
import { skillBySlug } from '../data/skills'
import { finderAnswersToSearchParams } from '../lib/finderParams'
import { familyLabels } from '../lib/toolFit'

const roleLabels = { student: 'Student', faculty: 'Faculty', staff: 'Staff', researcher: 'Researcher' }

export function ScenarioExplorer() {
  const [activeId, setActiveId] = useState(scenarios[0].id)
  const scenario = scenarios.find((item) => item.id === activeId) ?? scenarios[0]
  return (
    <section className="scenario-explorer" aria-labelledby="scenario-title">
      <div className="section-heading split-heading"><div><p className="eyebrow">Illustrative scenarios</p><h2 id="scenario-title">See the whole workflow in context</h2></div><p>These examples teach the decision pattern; they are not claims about measured product performance.</p></div>
      <div className="scenario-tabs" role="tablist" aria-label="Choose a role scenario">
        {scenarios.map((item) => <button id={`scenario-tab-${item.id}`} role="tab" aria-selected={item.id === scenario.id} aria-controls={`scenario-panel-${item.id}`} tabIndex={item.id === scenario.id ? 0 : -1} type="button" key={item.id} onClick={() => setActiveId(item.id)}>{roleLabels[item.role]}</button>)}
      </div>
      <article id={`scenario-panel-${scenario.id}`} role="tabpanel" aria-labelledby={`scenario-tab-${scenario.id}`} className="scenario-panel">
        <div className="scenario-lede"><p className="card-eyebrow">{roleLabels[scenario.role]} · {scenario.sensitivity} data</p><h3>{scenario.title}</h3><p>{scenario.situation}</p></div>
        <dl className="scenario-facts">
          <div><dt>Target output</dt><dd>{scenario.targetOutput}</dd></div>
          <div><dt>Product family</dt><dd>{familyLabels[scenario.toolFamily]}</dd></div>
          <div><dt>Workflow skill</dt><dd>{skillBySlug[scenario.skillSlug]?.name ?? 'Project-curated workflow'}</dd></div>
          <div><dt>Biggest risk</dt><dd>{scenario.biggestRisk}</dd></div>
        </dl>
        <div className="scenario-checks"><strong><ShieldCheck size={17} />Human checks</strong><ul>{scenario.humanChecks.map((check) => <li key={check}>{check}</li>)}</ul></div>
        <Link className="button button-small" to={`/recommend?${finderAnswersToSearchParams(scenario.answers).toString()}`}>Try this prefilled scenario <ArrowRight size={17} /></Link>
      </article>
    </section>
  )
}
