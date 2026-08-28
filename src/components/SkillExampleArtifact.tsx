import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'
import type { SkillExample } from '../types'

const statusLabels = { acceptable: 'Acceptable pattern', verify: 'Needs verification', revise: 'Revise before use' }

export function SkillExampleArtifact({ example }: { example: SkillExample }) {
  return <section className="skill-example" aria-labelledby="skill-example-title"><div className="section-heading"><p className="eyebrow">Educational mock output</p><h2 id="skill-example-title">Worked example</h2><p>This is a teaching artifact, not a claim that a product produced or validated this result.</p></div><div className="example-context"><div><h3>Context</h3><p>{example.context}</p></div><div><h3>Sample input</h3><p>{example.sampleInput}</p></div></div><div className="example-output" aria-label="Illustrative output sections">{example.outputSections.map((section) => <article key={section.label}><div><h3>{section.label}</h3>{section.status && <span className={`example-status status-${section.status}`}>{statusLabels[section.status]}</span>}</div><p>{section.content}</p></article>)}</div><div className="example-revision"><div><AlertTriangle aria-hidden="true" /><h3>Likely failure</h3><p>{example.likelyFailure}</p></div><div><RotateCcw aria-hidden="true" /><h3>Human revision</h3><p>{example.humanRevision}</p></div></div><p className="example-footnote"><CheckCircle2 size={16} />The example demonstrates structure and review behavior; always adapt it to real instructions and evidence.</p></section>
}
