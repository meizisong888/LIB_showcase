import { Check, CircleHelp, ExternalLink, FileWarning, ShieldAlert, UserCheck } from 'lucide-react'
import { DataDecisionTree } from '../components/DataDecisionTree'
import { PageHeader, SafetyCallout, SourceLinks } from '../components/Shared'
import { WorkflowMap } from '../components/WorkflowMap'
import { officialSources } from '../data/tools'
import { ui } from '../i18n/en'

const reviewTopics = [
  { icon: ShieldAlert, title: 'Use the institutional account', text: 'For Google, confirm “Managed by vt.edu.” For Microsoft, confirm the VT Hokies account and Enterprise Data Protection. A personal account is a different data boundary.' },
  { icon: FileWarning, title: 'Minimize before uploading', text: 'An approval for high-risk data is not blanket permission. Remove unnecessary identifiers and check contracts, IRB terms, research protocols, and other applicable rules.' },
  { icon: UserCheck, title: 'Keep a human accountable', text: 'Open sources, check claims and calculations, follow the instructor’s rules, disclose AI use when required, and make the final judgment yourself.' },
  { icon: CircleHelp, title: 'Stop when uncertain', text: 'If you cannot classify the data or confirm permission, do not upload it. Ask the instructor, PI, data steward, or responsible VT office.' },
]

export function ResponsibleUsePage() {
  return <>
    <PageHeader {...ui.pageHeaders.responsible} />
    <section className="container section"><WorkflowMap compact /></section>
    <section className="container section responsible-grid">{reviewTopics.map((topic) => { const Icon = topic.icon; return <article key={topic.title}><Icon aria-hidden="true" /><h2>{topic.title}</h2><p>{topic.text}</p></article> })}</section>
    <section className="safety-boundary"><div className="container"><SafetyCallout title="Export-controlled data and CUI: no AI tool"><p>Virginia Tech’s current AI Tools page states that high-risk data classified as export controlled or Controlled Unclassified Information is not authorized for use with any AI tool.</p><a href="https://ai.vt.edu/tools.html" target="_blank" rel="noreferrer">Read the official restriction <ExternalLink size={15} /></a></SafetyCallout></div></section>
    <section className="container section"><DataDecisionTree /></section>
    <section className="method-sections section"><div className="container two-column-content"><article><p className="eyebrow">Inclusion standard</p><h2>What qualifies for this catalog</h2><ul className="check-list"><li>Current VT evidence says students can access the exact service.</li><li>The institutional account, eligibility, cost, and restrictions are stated separately.</li><li>Capabilities appear only when a VT or ARC page explicitly supports them.</li><li>Employee-only, limited-pilot, personal, paid, and external-benefit products are not student recommendations.</li></ul></article><article><p className="eyebrow">Recommendation method</p><h2>Hard filters cannot be outscored</h2><ol className="number-list compact-list"><li><span>01</span>Verify student access and any ARC-account condition.</li><li><span>02</span>Apply data-use restrictions, including the complete CUI/export-control stop.</li><li><span>03</span>Require source grounding, files, coding, API, or multimodal support when selected.</li><li><span>04</span>Evaluate documented task fit and return at most three eligible choices.</li></ol></article></div></section>
    <section className="container section source-catalog"><div className="section-heading split-heading"><div><p className="eyebrow">Source register</p><h2>{officialSources.length} official references</h2></div><p>Only Virginia Tech and ARC documentation is used as evidence for student eligibility, institutional access, data approval, and recorded capabilities. All were re-opened on {ui.dates.currentReview}.</p></div><SourceLinks sources={officialSources} /></section>
    <section className="container uncertainty-section"><div><p className="eyebrow">Institutional account reminder</p><h2>Look for the protection indicator before entering university data.</h2><p>A correct product name is not enough. The signed-in VT instance is what carries the documented institutional protections.</p></div><div className="uncertainty-actions"><h3>Before you continue</h3><ul className="check-list"><li><Check size={14} aria-hidden="true" />Confirm the VT identity.</li><li><Check size={14} aria-hidden="true" />Confirm the data category.</li><li><Check size={14} aria-hidden="true" />Use the minimum necessary data.</li><li><Check size={14} aria-hidden="true" />Plan a human verification pass.</li></ul></div></section>
    <div className="section" />
  </>
}
