import { ArrowRight, BadgeCheck, ClipboardCheck, KeyRound, ListChecks, ShieldCheck, SlidersHorizontal } from 'lucide-react'

const steps = [
  { label: 'VT student access', note: 'Remove employee-only, pilot, and unverified account contexts.', icon: BadgeCheck },
  { label: 'ARC conditions', note: 'When relevant, require account, allocation, and VT network or VPN.', icon: KeyRound },
  { label: 'Data limits', note: 'Stop prohibited data and enforce the approved data boundary.', icon: ShieldCheck },
  { label: 'Every required feature', note: 'Check each source, file, web, citation, code, API, media, or image need independently.', icon: SlidersHorizontal },
  { label: 'Task fit', note: 'Evaluate only the tools that passed every hard filter.', icon: ListChecks },
  { label: 'Result', note: 'Return one top fit, or every equally suitable top match in alphabetical order.', icon: ClipboardCheck },
]

export function WorkflowMap({ compact = false }: { compact?: boolean }) {
  return (
    <figure className={compact ? 'workflow-map workflow-map-compact' : 'workflow-map'} aria-labelledby="workflow-map-title">
      <figcaption><p className="eyebrow">Recommendation sequence</p><h2 id="workflow-map-title">Eligibility comes before fit</h2><p>A tool cannot score its way past missing student access, an ARC condition, a data prohibition, or any required capability.</p></figcaption>
      <ol>{steps.map(({ label, note, icon: Icon }, index) => <li key={label}><div><span className="workflow-icon"><Icon aria-hidden="true" /></span><strong>{label}</strong><small>{note}</small></div>{index < steps.length - 1 && <ArrowRight className="workflow-arrow" aria-hidden="true" />}</li>)}</ol>
    </figure>
  )
}
