import { ArrowUpRight, CheckCircle2, CircleAlert, Clock3 } from 'lucide-react'
import type { ReactNode } from 'react'
import { sourceById } from '../data/sources'
import type { RiskLevel, VerificationStatus } from '../types'

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <header className="page-header container">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-lede">{description}</p>
      {children}
    </header>
  )
}

export function StatusBadge({ status }: { status: VerificationStatus }) {
  const label = status === 'verified' ? 'Verified' : status === 'needs-review' ? 'Needs review' : 'Outdated'
  return <span className={`status-badge status-${status}`}>{status === 'verified' ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}{label}</span>
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk-badge risk-${risk}`}>{risk} risk</span>
}

export function SourceLinks({ sourceIds, compact = false }: { sourceIds: string[]; compact?: boolean }) {
  const resolved = sourceIds.map((id) => sourceById[id]).filter(Boolean)
  return (
    <div className={compact ? 'source-links compact' : 'source-links'}>
      {!compact && <h2>Sources</h2>}
      <ul>
        {resolved.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">
              <span>{source.title}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            {!compact && <small>{source.publisher} · {source.tier} · checked {source.verifiedAt}</small>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SafetyCallout({ children, title = 'Pause before you upload' }: { children: ReactNode; title?: string }) {
  return <aside className="safety-callout"><CircleAlert aria-hidden="true" /><div><h2>{title}</h2><div>{children}</div></div></aside>
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty-state"><h2>{title}</h2><p>{children}</p></div>
}
