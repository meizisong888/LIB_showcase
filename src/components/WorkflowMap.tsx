import { ArrowRight, Bot, CheckCircle2, ClipboardList, SlidersHorizontal, Sparkles } from 'lucide-react'

const steps = [
  { label: 'Task', note: 'What outcome do you need?', icon: ClipboardList },
  { label: 'Constraints', note: 'Data, account, files, evidence', icon: SlidersHorizontal },
  { label: 'AI product', note: 'Documented capability fit', icon: Bot },
  { label: 'Workflow skill', note: 'Repeatable steps and prompt', icon: Sparkles },
  { label: 'Human check', note: 'Verify, decide, approve', icon: CheckCircle2 },
]

export function WorkflowMap() {
  return (
    <figure className="workflow-map" aria-labelledby="workflow-map-title">
      <figcaption><p className="eyebrow">A better decision model</p><h2 id="workflow-map-title">The product is one step—not the workflow</h2><p>Start with the job and its boundary. Then pair a capable product with a repeatable skill and accountable human review.</p></figcaption>
      <ol>
        {steps.map(({ label, note, icon: Icon }, index) => <li key={label}><div><span className="workflow-icon"><Icon aria-hidden="true" /></span><strong>{label}</strong><small>{note}</small></div>{index < steps.length - 1 && <ArrowRight className="workflow-arrow" aria-hidden="true" />}</li>)}
      </ol>
    </figure>
  )
}
