import { ExternalLink } from 'lucide-react'
import { AccessBadge, PageHeader, SourceLinks } from '../components/Shared'
import { capabilityLabels } from '../data/capabilities'
import { tools } from '../data/tools'
import { ui } from '../i18n/en'

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  return <article className="tool-card">
    <div className="tool-card-top"><div className="tool-identity"><span className="tool-initials" aria-hidden="true">{tool.initials}</span><div><h2>{tool.name}</h2><AccessBadge availability={tool.studentAvailability} /></div></div></div>
    <p>{tool.summary}</p>
    <div className="tag-row">{tool.verifiedCapabilities.map((record) => <span key={record.capability}>{capabilityLabels[record.capability]}</span>)}</div>
    <dl className="tool-facts">
      <div><dt>Eligibility</dt><dd>{tool.eligibility}</dd></div>
      <div><dt>Required account</dt><dd>{tool.requiredAccount}</dd></div>
      <div><dt>Cost or limits</dt><dd>{tool.costOrLimits}</dd></div>
      <div><dt>Data approval</dt><dd>Public, internal, and sensitive/high-risk university information. Additional rules can still apply.</dd></div>
      <div><dt>Never upload</dt><dd>{tool.prohibitedData.join('; ')}.</dd></div>
    </dl>
    {tool.conditionalRequirements.length > 0 && <div className="vt-note"><strong>Conditions</strong><ul>{tool.conditionalRequirements.map((condition) => <li key={condition}>{condition}</li>)}</ul></div>}
    {tool.institutionalAccountReminder && <p className="account-reminder">{tool.institutionalAccountReminder}</p>}
    <a className="button button-small access-link" href={tool.accessUrl} target="_blank" rel="noopener noreferrer">{tool.accessCta} <ExternalLink size={15} aria-hidden="true" /></a>
    <SourceLinks sources={tool.officialSources} compact />
    <p className="verified-date">Last verified: <time dateTime={tool.lastVerified}>{tool.lastVerified}</time></p>
  </article>
}

export function ToolsPage() {
  const coreTools = tools.filter((tool) => tool.studentAvailability === 'all-vt-students')
  const conditionalTools = tools.filter((tool) => tool.studentAvailability === 'arc-account-required')
  return <>
    <PageHeader {...ui.pageHeaders.tools}><div className="header-inline-note">Use the exact VT institutional account named on each card. Personal accounts do not automatically inherit VT protections.</div></PageHeader>
    <section className="container tools-workspace"><div className="results-meta"><p><strong>{coreTools.length}</strong> core tools available to all VT students</p><span>Verified {ui.dates.currentReview}</span></div><div className="tool-card-grid">{coreTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></section>
    <section className="conditional-tools"><div className="container"><div className="section-heading"><p className="eyebrow">Conditional option</p><h2>Only recommend after all ARC conditions are confirmed</h2><p>Open OnDemand is not eligible without an ARC account, an active allocation, and VT network or VPN access.</p></div><div className="tool-card-grid single-card">{conditionalTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></div></section>
  </>
}
