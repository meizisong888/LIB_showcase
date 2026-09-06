import { Check, CircleAlert, ExternalLink, Minus, ShieldX } from 'lucide-react'
import { AccessBadge, SourceLinks } from './Shared'
import type { RecommendationResult, ToolEvaluation, VerifiedCapability } from '../types'

const capabilityLabels: Record<VerifiedCapability, string> = {
  'general-chat': 'General chat',
  drafting: 'Drafting',
  revising: 'Writing revision',
  summarization: 'Summarization',
  'source-grounding': 'Answers from supplied sources',
  'file-upload': 'File upload',
  coding: 'Coding',
  'api-access': 'API access',
  'web-search': 'Web search',
  'multimodal-input': 'Multimodal input',
  'image-generation': 'Image generation',
}

function ToolChoice({ item, primary = false }: { item: ToolEvaluation; primary?: boolean }) {
  const tool = item.tool
  const directAccess = tool.studentAvailability === 'all-vt-students'
    ? 'Yes. Sign in with the required VT institutional account.'
    : 'Conditional. The student must already have the required ARC account and allocation.'
  return <article className={primary ? 'result-card primary-result' : 'result-card'}>
    <div className="result-label">{primary ? 'Primary recommendation' : 'Eligible alternative'}</div>
    <div className="result-title-row"><div className="tool-identity"><span className="tool-initials" aria-hidden="true">{tool.initials}</span><div><h3>{tool.name}</h3><AccessBadge availability={tool.studentAvailability} /></div></div></div>
    <p>{tool.summary}</p>
    <section className="reason-list" aria-label={`Why ${tool.name} fits`}><h4>Why it fits this task</h4>{item.matchReasons.slice(0, 4).map((reason) => <div key={reason}><Check size={16} aria-hidden="true" /><span>{reason}</span></div>)}</section>
    <dl className="result-facts">
      <div><dt>Can a student use it directly?</dt><dd>{directAccess}</dd></div>
      <div><dt>Required account</dt><dd>{tool.requiredAccount}</dd></div>
      <div><dt>Known cost or limits</dt><dd>{tool.costOrLimits}</dd></div>
      <div><dt>Approved data in this guide</dt><dd>Public, internal, and sensitive/high-risk university information, subject to additional rules.</dd></div>
      <div className="prohibited-fact"><dt>Never upload</dt><dd><ul>{tool.prohibitedData.map((item) => <li key={item}>{item}</li>)}</ul></dd></div>
    </dl>
    <div className="tag-row" aria-label="Verified capabilities">{tool.verifiedCapabilities.map((capability) => <span key={capability}>{capabilityLabels[capability]}</span>)}</div>
    <details className="usage-steps"><summary>Suggested use steps</summary><ol>{tool.usageSteps.map((step) => <li key={step}>{step}</li>)}</ol></details>
    <a className="button button-small access-link" href={tool.accessUrl} target="_blank" rel="noreferrer">Open official access point <ExternalLink size={15} aria-hidden="true" /></a>
    <SourceLinks sources={tool.officialSources} compact />
    <p className="verified-date">Last verified: <time dateTime={tool.lastVerified}>{tool.lastVerified}</time></p>
  </article>
}

export function RecommendationBreakdown({ result }: { result: RecommendationResult }) {
  const alternativeIds = new Set(result.alternatives.map((item) => item.tool.id))
  return <>
    {result.primary && <div className="result-grid"><ToolChoice item={result.primary} primary />{result.alternatives.map((item) => <ToolChoice item={item} key={item.tool.id} />)}</div>}

    <section className="why-not-others" aria-labelledby="why-not-title"><h3 id="why-not-title">Why other tools were not selected</h3><p>Every tool below was evaluated in the required order. An access, data, or capability failure cannot be offset by task fit.</p>{result.notSelected.length ? <ul>{result.notSelected.map((item) => <li key={item.tool.id}><strong>{item.tool.name}</strong><span>{item.exclusionReason ?? (alternativeIds.has(item.tool.id) ? 'Eligible and shown above as an alternative; the primary has at least as direct a documented fit for this brief.' : 'It passed the hard filters, but its documented task fit was less direct than the options shown.')}</span></li>)}</ul> : <p>No additional verified VT student tools are in the current catalog.</p>}</section>

    {result.halted && <div className="halt-card"><CircleAlert aria-hidden="true" /><div><h3>{result.message}</h3><p>Do not substitute an unverified consumer or paid product just to force a result. Change the requirements only if the real task and data allow it.</p></div></div>}

    {!result.halted && result.notSelected.some((item) => item.exclusionStage === 'data-use') && <div className="excluded-note"><ShieldX size={18} aria-hidden="true" /><p>At least one catalog option was removed at the data-use stage. Review the reason above before changing your answers.</p></div>}
    {!result.halted && result.primary && <div className="result-reminder"><Minus size={18} aria-hidden="true" /><p>This is a documented-fit recommendation, not a claim that the tool is the industry’s highest-quality AI. Follow course rules and verify the output yourself.</p></div>}
  </>
}
