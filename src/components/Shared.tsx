import { ArrowUpRight, CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import type { OfficialSource, StudentAvailability } from '../types'

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <header className="page-header container"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-lede">{description}</p>{children}</header>
}

export function AccessBadge({ availability }: { availability: StudentAvailability }) {
  const label = availability === 'all-vt-students' ? 'Available to all VT students' : availability === 'arc-account-required' ? 'Requires ARC account' : 'Conditional access'
  return <span className={`access-badge access-${availability}`}>{label}</span>
}

export function SourceLinks({ sources }: { sources: OfficialSource[] }) {
  return <div className="source-links"><ul aria-label="Official sources">{sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.title}</span><ArrowUpRight size={15} aria-hidden="true" /></a></li>)}</ul></div>
}

export function SafetyCallout({ children, title = 'Check the data before you upload' }: { children: ReactNode; title?: string }) {
  return <aside className="safety-callout"><CircleAlert aria-hidden="true" /><div><h2>{title}</h2><div>{children}</div></div></aside>
}
