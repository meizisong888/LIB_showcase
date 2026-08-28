import { Check, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

const checklist = [
  { id: 'publisher', label: 'Publisher and download source are verified', risk: 'Supply-chain' },
  { id: 'scope', label: 'Requested file, account, and repository scopes are necessary', risk: 'Authorization' },
  { id: 'network', label: 'Network destinations and external services are understood', risk: 'Data transfer' },
  { id: 'commands', label: 'Commands and code execution can be reviewed before approval', risk: 'Execution' },
  { id: 'secrets', label: 'Secrets, credentials, and unrelated files are excluded', risk: 'Credential exposure' },
  { id: 'rollback', label: 'A low-risk test, reviewer, and rollback path are ready', risk: 'Operational' },
]

export function SkillEvaluationChecklist() {
  const [checked, setChecked] = useState<string[]>([])
  const remaining = useMemo(() => checklist.filter((item) => !checked.includes(item.id)), [checked])
  return <section className="skill-evaluation" aria-labelledby="skill-evaluation-title"><div><p className="eyebrow">Local permission review</p><h2 id="skill-evaluation-title">Evaluate an installable skill before connecting it</h2><p>Nothing is installed or transmitted. Check each item only after you have verified it.</p></div><div className="evaluation-layout"><div className="evaluation-checks">{checklist.map((item) => <label key={item.id}><input type="checkbox" checked={checked.includes(item.id)} onChange={(event) => setChecked((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /><span><Check size={15} /></span><strong>{item.label}</strong></label>)}</div><aside aria-live="polite" className={remaining.length ? 'permission-summary' : 'permission-summary ready'}><ShieldCheck aria-hidden="true" /><h3>{remaining.length ? `${remaining.length} permission checks remain` : 'Review checklist complete'}</h3><p>{remaining.length ? 'Unresolved risk areas:' : 'This checklist reduces uncertainty; it is not a security approval.'}</p>{remaining.length > 0 && <ul>{remaining.map((item) => <li key={item.id}>{item.risk}</li>)}</ul>}</aside></div></section>
}
