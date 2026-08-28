import { ArrowRight, Check, CircleAlert, Minus, ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RecommendationResult, ScoredTool } from '../types'
import { familyLabels, fitLabels } from '../lib/toolFit'

function ProductChoice({ item, primary = false }: { item: ScoredTool; primary?: boolean }) {
  const positives = item.reasons.filter((reason) => reason.points > 0).sort((a, b) => b.points - a.points)
  const tradeoff = item.reasons.find((reason) => reason.points < 0)?.detail ?? item.tool.limitations[0]
  return <article className={primary ? 'result-card primary-result' : 'result-card'}><div className="result-label">{primary ? 'Primary product' : 'Alternative product'}</div><div className="result-title-row"><div><p>{familyLabels[item.tool.family]}</p><h3>{item.tool.name}</h3></div><span className={`fit-badge fit-${item.fit}`}>{fitLabels[item.fit]} fit</span></div><p>{item.tool.summary}</p><div className="reason-list"><h4>Why it fits</h4>{positives.slice(0, 4).map((reason) => <div key={reason.label}><Check size={16} /><span><strong>{reason.label}</strong> · {reason.detail}</span></div>)}</div><div className="tradeoff-box"><h4>Key limitation</h4><p><Minus size={15} />{tradeoff}</p></div><details className="score-details"><summary>Show transparent fit calculation</summary><ul>{item.reasons.map((reason) => <li key={reason.label}><span>{reason.label}: {reason.detail}</span><strong>{reason.points > 0 ? '+' : ''}{reason.points}</strong></li>)}</ul><p>Total: {item.score} points. Points organize this answer; they are not a quality benchmark.</p></details></article>
}

export function RecommendationBreakdown({ result }: { result: RecommendationResult }) {
  const whyNot = result.primary ? result.alternatives.map((alternative) => {
    const difference = result.primary!.reasons.find((primaryReason) => {
      const alternativeReason = alternative.reasons.find((reason) => reason.label === primaryReason.label)
      return alternativeReason && alternativeReason.points < primaryReason.points
    })
    const alternativeReason = difference ? alternative.reasons.find((reason) => reason.label === difference.label) : alternative.reasons.find((reason) => reason.points < 0)
    return { name: alternative.tool.name, detail: alternativeReason?.detail ?? alternative.tool.limitations[0] }
  }) : []
  return <>
    {result.primary && <div className="result-grid"><ProductChoice item={result.primary} primary />{result.alternatives.map((item) => <ProductChoice item={item} key={item.tool.id} />)}</div>}
    {whyNot.length > 0 && <section className="why-not-others"><h3>Why not the others?</h3><p>The alternatives remain viable; these are the clearest differences for this brief.</p><ul>{whyNot.map((item) => <li key={item.name}><strong>{item.name}:</strong> {item.detail}</li>)}</ul></section>}
    {result.excludedTools.length > 0 && <details className="excluded-tools"><summary><ShieldX size={17} />Safety-excluded products ({result.excludedTools.length})</summary><ul>{result.excludedTools.map((item) => <li key={item.tool.id}><strong>{item.tool.name}</strong><span>{item.exclusions.join(' ')}</span></li>)}</ul></details>}
    {result.workflowSkill && <div className="recommendation-next-grid"><article className="next-card"><p className="eyebrow">Selected workflow skill</p><h3>{result.workflowSkill.name}</h3><p>{result.workflowSkill.summary}</p><ul>{result.workflowReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><Link to={`/skills/${result.workflowSkill.slug}`}>Open steps, prompt, and example <ArrowRight size={16} /></Link></article>{result.installableSkill && <article className="next-card permission-card"><p className="eyebrow">Optional installable integration</p><h3>{result.installableSkill.name}</h3><p>{result.installableSkill.summary}</p><p><strong>No automatic install.</strong> Review the publisher and permissions first.</p><Link to={`/skills/${result.installableSkill.slug}`}>Review permissions <ArrowRight size={16} /></Link></article>}<article className="next-card checklist-card"><p className="eyebrow">Human handoff</p><h3>Must be done manually</h3><p>{result.roleGuidance}</p><ul>{result.mustDoManually.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></article></div>}
    {result.halted && <div className="halt-card"><CircleAlert /><div><h3>Use a human-only path for now</h3><p>Classify or remove the data, consult the responsible data steward or policy owner, and only then return to the finder.</p><Link to="/safety" className="button button-small">Review safety guidance</Link></div></div>}
  </>
}
