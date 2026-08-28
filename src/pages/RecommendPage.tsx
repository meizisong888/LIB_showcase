import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FinderAnswerSummary } from '../components/FinderAnswerSummary'
import { RecommendationBreakdown } from '../components/RecommendationBreakdown'
import { PageHeader, SafetyCallout } from '../components/Shared'
import { tasks } from '../data/tasks'
import { ui } from '../i18n/en'
import { defaultFinderAnswers, finderAnswersFromSearchParams } from '../lib/finderParams'
import { recommendTools } from '../lib/recommend'
import type { CollaborationMode, Ecosystem, FinderAnswers } from '../types'

const yesNoFields = [
  { key: 'needsWeb', label: 'Need current web research?', help: 'The task depends on current external information.' },
  { key: 'citations', label: 'Need a traceable source trail?', help: 'Readers need to inspect evidence behind factual claims.' },
  { key: 'editFiles', label: 'Need to edit or create files?', help: 'A document, slide, sheet, or repository must change.' },
  { key: 'coding', label: 'Does the task involve programming?', help: 'Code generation, repository work, or executable analysis.' },
] as const

export function RecommendPage() {
  const [searchParams] = useSearchParams()
  const initialAnswers = useMemo(() => {
    if (searchParams.has('task') && !searchParams.has('taskId')) {
      const taskId = searchParams.get('task')
      return { ...defaultFinderAnswers, taskId: tasks.some((task) => task.id === taskId) ? taskId! : defaultFinderAnswers.taskId }
    }
    return finderAnswersFromSearchParams(searchParams)
  }, [searchParams])
  const [answers, setAnswers] = useState<FinderAnswers>(initialAnswers)
  const [submitted, setSubmitted] = useState(false)
  const result = useMemo(() => submitted ? recommendTools(answers) : null, [answers, submitted])

  const update = <K extends keyof FinderAnswers>(key: K, value: FinderAnswers[K]) => { setAnswers((current) => ({ ...current, [key]: value })); setSubmitted(false) }
  const submit = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); window.setTimeout(() => document.getElementById('recommendation-results')?.focus(), 0) }

  return <>
    <PageHeader {...ui.pageHeaders.recommend} />
    <div className="container finder-layout"><form className="finder-form" onSubmit={submit}>
      <section className="form-section" aria-labelledby="context-heading"><div className="form-section-title"><span>01</span><div><h2 id="context-heading">Task context</h2><p>Define the job and output before choosing a product.</p></div></div><div className="form-grid two-col"><label><span>Your role</span><select value={answers.role} onChange={(event) => update('role', event.target.value)}><option value="student">Student</option><option value="faculty">Faculty</option><option value="staff">Staff</option><option value="researcher">Researcher</option></select></label><label><span>Task type</span><select value={answers.taskId} onChange={(event) => update('taskId', event.target.value)}>{tasks.map((task) => <option key={task.id} value={task.id}>{task.name}</option>)}</select></label><label><span>Primary input</span><select value={answers.inputType} onChange={(event) => update('inputType', event.target.value)}><option value="text">Text or notes</option><option value="documents">Documents / PDFs</option><option value="spreadsheets">Spreadsheet / data</option><option value="images">Images / media</option><option value="code">Code / repository</option><option value="audio">Audio / meeting</option></select></label><label><span>Expected output</span><select value={answers.outputType} onChange={(event) => update('outputType', event.target.value)}><option value="brief">Brief or answer</option><option value="document">Edited document</option><option value="presentation">Presentation</option><option value="analysis">Data analysis</option><option value="code">Code change</option><option value="action-log">Action log</option></select></label></div></section>

      <section className="form-section" aria-labelledby="requirements-heading"><div className="form-section-title"><span>02</span><div><h2 id="requirements-heading">Capabilities</h2><p>Select every condition the workflow must support.</p></div></div><div className="toggle-grid">{yesNoFields.map((field) => <label className="toggle-card" key={field.key}><input type="checkbox" checked={answers[field.key]} onChange={(event) => update(field.key, event.target.checked)} /><span className="fake-checkbox"><Check size={15} /></span><span><strong>{field.label}</strong><small>{field.help}</small></span></label>)}</div></section>

      <section className="form-section" aria-labelledby="constraints-heading"><div className="form-section-title"><span>03</span><div><h2 id="constraints-heading">Environment & data boundary</h2><p>Account context changes both capability and protection.</p></div></div><div className="form-grid two-col"><label><span>Where will work continue?</span><select value={answers.collaborationMode} onChange={(event) => update('collaborationMode', event.target.value as CollaborationMode)}><option value="individual">Individual work</option><option value="shared-workspace">Shared AI workspace</option><option value="document-coauthoring">Document coauthoring</option><option value="repository-collaboration">Repository collaboration</option><option value="organization-account">Organization-managed workspace</option></select></label><label><span>Preferred ecosystem</span><select value={answers.ecosystem} onChange={(event) => update('ecosystem', event.target.value as Ecosystem)}><option value="none">No preference</option><option value="microsoft">Microsoft 365</option><option value="google">Google Workspace</option><option value="github">GitHub</option></select></label><label><span>Cost / access</span><select value={answers.access} onChange={(event) => update('access', event.target.value as FinderAnswers['access'])}><option value="any">Any available option</option><option value="free">No additional paid license</option><option value="vt">VT-provided account</option><option value="paid">Paid plan available</option></select></label></div><fieldset className="sensitivity-fieldset"><legend>Data sensitivity</legend><p className="field-help">These choices route to VT’s authoritative standard; they do not replace formal classification.</p><div className="sensitivity-options">{[
        { value: 'public', label: 'Public', help: 'Published or intentionally public.' }, { value: 'internal', label: 'Internal', help: 'Nonpublic operational, student, or research material.' }, { value: 'restricted', label: 'Restricted', help: 'High-risk, regulated, contractual, or sensitive material.' }, { value: 'unknown', label: 'I’m not sure', help: 'Classification or upload permission is unclear.' },
      ].map((option) => <label key={option.value}><input type="radio" name="sensitivity" value={option.value} checked={answers.sensitivity === option.value} onChange={() => update('sensitivity', option.value as FinderAnswers['sensitivity'])} /><span><strong>{option.label}</strong><small>{option.help}</small></span></label>)}</div></fieldset></section>
      <div className="form-submit"><p><ShieldCheck size={18} />The recommender runs locally; these selections are not uploaded.</p><button className="button" type="submit">Build my recommendation <ArrowRight size={18} /></button></div>
    </form><aside className="finder-aside"><p className="eyebrow">How matching works</p><h2>Safety, then capability fit</h2><ol><li><span>1</span><div><strong>Hard safety boundary</strong><p>Exclude account contexts outside the selected data level.</p></div></li><li><span>2</span><div><strong>Documented fit</strong><p>Strong, capable, or conditional—not a product-quality ranking.</p></div></li><li><span>3</span><div><strong>Workflow handoff</strong><p>Select a skill and identify what a human must do.</p></div></li></ol><Link to="/methodology">Read full methodology <ArrowRight size={15} /></Link></aside></div>

    {result && <section id="recommendation-results" className="results-section" tabIndex={-1} aria-live="polite"><div className="container"><div className="section-heading"><p className="eyebrow">Your recommendation</p><h2>{result.halted ? 'Pause: resolve the data boundary first' : 'A product, a workflow, and a human handoff'}</h2></div><FinderAnswerSummary answers={answers} /><SafetyCallout title={result.halted ? 'Do not upload yet' : 'Data boundary'}><p>{result.safetyMessage}</p></SafetyCallout>{result.closeCall && <div className="close-call"><strong>Close capability fit:</strong> the top options differ mainly by your account, ecosystem, and handoff needs—not universal quality.</div>}<RecommendationBreakdown result={result} />{!result.halted && <details className="human-checklist-details"><summary>Full human verification checklist ({result.humanChecklist.length})</summary><ul>{result.humanChecklist.map((item) => <li key={item}>{item}</li>)}</ul></details>}</div></section>}
  </>
}
