import { ArrowRight, BadgeCheck, ClipboardCheck, ListChecks, ShieldCheck, SlidersHorizontal } from 'lucide-react'

const steps = [
  { label: 'Student access', note: 'Remove employee-only, pilot, and unavailable account contexts.', icon: BadgeCheck },
  { label: 'Data limits', note: 'Stop prohibited data and enforce the approved data boundary.', icon: ShieldCheck },
  { label: 'Required features', note: 'Confirm sources, files, coding, API, or multimodal support.', icon: SlidersHorizontal },
  { label: 'Task fit', note: 'Evaluate only the tools that passed every hard filter.', icon: ListChecks },
  { label: 'Recommendation', note: 'Return one primary fit and no more than two alternatives.', icon: ClipboardCheck },
]

export function WorkflowMap({ compact = false }: { compact?: boolean }) {
  return (
    <figure className={compact ? 'workflow-map workflow-map-compact' : 'workflow-map'} aria-labelledby="workflow-map-title">
      <figcaption><p className="eyebrow">Recommendation sequence</p><h2 id="workflow-map-title">Eligibility comes before fit</h2><p>A tool cannot score its way past missing student access, a data prohibition, or a required capability.</p></figcaption>
      <ol>{steps.map(({ label, note, icon: Icon }, index) => <li key={label}><div><span className="workflow-icon"><Icon aria-hidden="true" /></span><strong>{label}</strong><small>{note}</small></div>{index < steps.length - 1 && <ArrowRight className="workflow-arrow" aria-hidden="true" />}</li>)}</ol>
    </figure>
  )
}
