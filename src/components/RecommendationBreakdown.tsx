import { Check, CircleAlert, ExternalLink, Minus, ShieldX } from 'lucide-react'
import { capabilityLabels } from '../data/capabilities'
import { FIT_DISCLAIMER } from '../lib/recommend'
import type { RecommendationResult, ToolEvaluation } from '../types'
import { AccessBadge, SourceLinks } from './Shared'

function evidenceFor(item: ToolEvaluation) {
  const ids = new Set([
    ...(item.taskSupport?.sourceIds ?? []),
    ...item.matchedCapabilities.flatMap((record) => record.sourceIds),
  ])
  return item.tool.officialSources.filter((source) => ids.has(source.id))
}

function ToolChoice({ item, label, emphasized = false }: { item: ToolEvaluation; label: string; emphasized?: boolean }) {
  const tool = item.tool
  const directAccess = tool.studentAvailability === 'all-vt-students'
    ? 'Yes. Sign in with the required VT institutional account.'
    : 'Conditional. ARC account, active allocation, and VT network or VPN access must all be confirmed.'
  const evidence = evidenceFor(item)
  return <article className={emphasized ? 'result-card primary-result' : 'result-card'}>
    <div className="result-label">{label}</div>
    <div className="result-title-row"><div className="tool-identity"><span className="tool-initials" aria-hidden="true">{tool.initials}</span><div><h3>{tool.name}</h3><AccessBadge availability={tool.studentAvailability} /></div></div></div>
    <p>{tool.summary}</p>
    <section className="reason-list" aria-label={`Why ${tool.name} fits`}><h4>Why it fits this task</h4><div><Check size={16} aria-hidden="true" /><span>{item.taskSupport?.reason}</span></div></section>
    <section className="matched-list" aria-label={`Mandatory features satisfied by ${tool.name}`}><h4>Satisfied mandatory features</h4>{item.matchedCapabilities.length
      ? <ul>{item.matchedCapabilities.map((record) => <li key={record.capability}><strong>{capabilityLabels[record.capability]}</strong><span>{record.evidenceSummary}</span></li>)}</ul>
      : <p>No extra feature was selected; this match is based on documented task fit.</p>}
    </section>
    <section className="limit-list" aria-label={`When ${tool.name} is not suitable`}><h4>Not suitable when</h4><ul>{tool.notSuitableWhen.map((condition) => <li key={condition}>{condition}</li>)}</ul></section>
    <dl className="result-facts">
      <div><dt>Can a student use it directly?</dt><dd>{directAccess}</dd></div>
      <div><dt>Required account</dt><dd>{tool.requiredAccount}</dd></div>
      <div><dt>Known cost or limits</dt><dd>{tool.costOrLimits}</dd></div>
      <div><dt>Approved data in this guide</dt><dd>Public, internal, and sensitive/high-risk university information, subject to additional rules.</dd></div>
      <div className="prohibited-fact"><dt>Never upload</dt><dd><ul>{tool.prohibitedData.map((prohibition) => <li key={prohibition}>{prohibition}</li>)}</ul></dd></div>
    </dl>
    {tool.institutionalAccountReminder && <p className="account-reminder"><ShieldX size={16} aria-hidden="true" />{tool.institutionalAccountReminder}</p>}
    <a className="button button-small access-link" href={tool.accessUrl} target="_blank" rel="noopener noreferrer">{tool.accessCta} <ExternalLink size={15} aria-hidden="true" /></a>
    <details className="evidence-details"><summary>View official VT evidence</summary><SourceLinks sources={evidence} compact /></details>
    <p className="verified-date">Last verified: <time dateTime={tool.lastVerified}>{tool.lastVerified}</time></p>
  </article>
}

export function RecommendationBreakdown({ result }: { result: RecommendationResult }) {
  const topLabel = result.kind === 'tie' ? 'Equally suitable verified match' : 'Primary recommendation'
  return <>
    {result.topMatches.length > 0 && <>
      {result.kind === 'tie' && <div className="tie-heading"><h3>Equally suitable verified matches</h3><p>The official evidence and your selected requirements do not justify ranking one of these tools above another. All tied tools are shown alphabetically.</p></div>}
      <div className={`result-grid ${result.kind === 'tie' ? 'tied-results' : ''}`}>{result.topMatches.map((item) => <ToolChoice item={item} key={item.tool.id} label={topLabel} emphasized />)}{result.alternatives.map((item) => <ToolChoice item={item} key={item.tool.id} label="Eligible alternative" />)}</div>
    </>}

    {result.halted && <div className="halt-card"><CircleAlert aria-hidden="true" /><div><h3>{result.message}</h3><p>Do not substitute an unverified consumer or paid product just to force a result. Change the requirements only if the real task and data allow it.</p></div></div>}

    <section className="why-not-others" aria-labelledby="why-not-title"><h3 id="why-not-title">Why other tools were not selected</h3><p>Every tool was evaluated in the required order. An access, ARC, data, or capability failure cannot be offset by task fit.</p>{result.notSelected.length ? <ul>{result.notSelected.map((item) => <li key={item.tool.id}><strong>{item.tool.name}</strong><span>{item.exclusionReason ?? 'It passed the hard filters, but its documented task fit was lower than the matches shown.'}</span></li>)}</ul> : <p>No additional verified VT student tools remain outside the matches shown.</p>}</section>

    {!result.halted && result.notSelected.some((item) => item.exclusionStage === 'data-use') && <div className="excluded-note"><ShieldX size={18} aria-hidden="true" /><p>At least one catalog option was removed at the data-use stage. Review the reason above before changing your selections.</p></div>}
    {!result.halted && <div className="result-reminder"><Minus size={18} aria-hidden="true" /><p>{FIT_DISCLAIMER} Follow course rules and verify the output yourself.</p></div>}
  </>
}
