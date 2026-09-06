import { ExternalLink } from 'lucide-react'
import { AccessBadge, PageHeader, SourceLinks } from '../components/Shared'
import { tools } from '../data/tools'
import { ui } from '../i18n/en'
import type { VerifiedCapability } from '../types'

const capabilityLabels: Record<VerifiedCapability, string> = {
  'general-chat': 'General chat', drafting: 'Drafting', revising: 'Writing revision', summarization: 'Summarization',
  'source-grounding': 'Answers from supplied sources', 'file-upload': 'File upload', coding: 'Coding', 'api-access': 'API access',
  'web-search': 'Web search', 'multimodal-input': 'Multimodal input', 'image-generation': 'Image generation',
}

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  return <article className="tool-card">
    <div className="tool-card-top"><div className="tool-identity"><span className="tool-initials" aria-hidden="true">{tool.initials}</span><div><h2>{tool.name}</h2><AccessBadge availability={tool.studentAvailability} /></div></div></div>
    <p>{tool.summary}</p>
    <div className="tag-row">{tool.verifiedCapabilities.map((capability) => <span key={capability}>{capabilityLabels[capability]}</span>)}</div>
    <dl className="tool-facts">
      <div><dt>Eligibility</dt><dd>{tool.eligibility}</dd></div>
      <div><dt>Required account</dt><dd>{tool.requiredAccount}</dd></div>
      <div><dt>Cost or limits</dt><dd>{tool.costOrLimits}</dd></div>
      <div><dt>Data approval</dt><dd>Public, internal, and sensitive/high-risk university information. Additional rules can still apply.</dd></div>
      <div><dt>Never upload</dt><dd>{tool.prohibitedData.join('; ')}.</dd></div>
    </dl>
    {tool.conditionalRequirements.length > 0 && <div className="vt-note"><strong>Conditions</strong><ul>{tool.conditionalRequirements.map((condition) => <li key={condition}>{condition}</li>)}</ul></div>}
    <a className="button button-small access-link" href={tool.accessUrl} target="_blank" rel="noreferrer">Open access point <ExternalLink size={15} aria-hidden="true" /></a>
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
    <section className="conditional-tools"><div className="container"><div className="section-heading"><p className="eyebrow">Conditional option</p><h2>Only recommend when the student confirms ARC access</h2><p>Open OnDemand is not a fallback for students without an ARC account and allocation.</p></div><div className="tool-card-grid single-card">{conditionalTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></div></section>
  </>
}
