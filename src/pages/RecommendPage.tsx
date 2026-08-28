import { ArrowRight, Check, CircleAlert, Minus, ShieldCheck, Sparkles } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SafetyCallout, PageHeader, SourceLinks } from '../components/Shared'
import { tasks } from '../data/tasks'
import { ui } from '../i18n/en'
import { recommendTools } from '../lib/recommend'
import type { Ecosystem, FinderAnswers, ScoredTool } from '../types'

const yesNoFields = [
  { key: 'needsWeb', label: 'Need current web research?', help: 'The task depends on current or external information.' },
  { key: 'citations', label: 'Must provide sources or citations?', help: 'Readers need a traceable evidence trail.' },
  { key: 'editFiles', label: 'Need to edit or create files?', help: 'The product must change a document, slide, sheet, or repository.' },
  { key: 'coding', label: 'Does the task involve programming?', help: 'Code generation, repository work, or executable analysis.' },
  { key: 'collaboration', label: 'Need team collaboration?', help: 'Shared context, files, reviews, or ecosystem access matter.' },
] as const

const defaultAnswers: FinderAnswers = {
  role: 'student', taskId: 'research', inputType: 'text', outputType: 'brief', needsWeb: true,
  citations: true, editFiles: false, coding: false, collaboration: false, ecosystem: 'none', sensitivity: 'public', access: 'any',
}

function ToolResultCard({ item, primary = false }: { item: ScoredTool; primary?: boolean }) {
  const positives = item.reasons.filter((reason) => reason.points > 0).sort((a, b) => b.points - a.points)
  const tradeoffs = item.reasons.filter((reason) => reason.points < 0)
  return (
    <article className={primary ? 'result-card primary-result' : 'result-card'}>
      <div className="result-label">{primary ? <><Sparkles size={16} /> Best fit for these inputs</> : 'Alternative'}</div>
      <div className="result-title-row"><div><p>{item.tool.category}</p><h3>{item.tool.name}</h3></div><span className="score-chip">{item.score} fit points</span></div>
      <p>{item.tool.summary}</p>
      <div className="reason-list">
        <h4>Why it fits</h4>
        {positives.slice(0, 5).map((reason) => <div key={reason.label}><Check size={16} /><span><strong>{reason.label}</strong> · {reason.detail}</span><b>+{reason.points}</b></div>)}
      </div>
      <div className="tradeoff-box">
        <h4>Key trade-off</h4>
        {tradeoffs.length ? tradeoffs.map((reason) => <p key={reason.label}><Minus size={15} />{reason.detail}</p>) : <p><Minus size={15} />Strong fit does not remove the need to verify outputs and account protections.</p>}
      </div>
      <div className="not-for"><h4>Do not use it when</h4><ul>{item.tool.limitations.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></div>
      <SourceLinks sourceIds={item.tool.sourceIds} compact />
    </article>
  )
}

export function RecommendPage() {
  const [searchParams] = useSearchParams()
  const initialTask = searchParams.get('task')
  const [answers, setAnswers] = useState<FinderAnswers>({ ...defaultAnswers, taskId: tasks.some((task) => task.id === initialTask) ? initialTask! : defaultAnswers.taskId })
  const [submitted, setSubmitted] = useState(false)
  const result = useMemo(() => submitted ? recommendTools(answers) : null, [answers, submitted])

  const update = <K extends keyof FinderAnswers>(key: K, value: FinderAnswers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }))
    setSubmitted(false)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    window.setTimeout(() => document.getElementById('recommendation-results')?.focus(), 0)
  }

  return (
    <>
      <PageHeader {...ui.pageHeaders.recommend} />
      <div className="container finder-layout">
        <form className="finder-form" onSubmit={submit}>
          <section className="form-section" aria-labelledby="context-heading">
            <div className="form-section-title"><span>01</span><div><h2 id="context-heading">Task context</h2><p>What are you doing, and in what role?</p></div></div>
            <div className="form-grid two-col">
              <label><span>Your role</span><select value={answers.role} onChange={(event) => update('role', event.target.value)}><option value="student">Student</option><option value="faculty">Faculty</option><option value="staff">Staff</option><option value="researcher">Researcher</option></select></label>
              <label><span>Task type</span><select value={answers.taskId} onChange={(event) => update('taskId', event.target.value)}>{tasks.map((task) => <option key={task.id} value={task.id}>{task.name}</option>)}</select></label>
              <label><span>Primary input</span><select value={answers.inputType} onChange={(event) => update('inputType', event.target.value)}><option value="text">Text or notes</option><option value="documents">Documents / PDFs</option><option value="spreadsheets">Spreadsheet / data</option><option value="images">Images / media</option><option value="code">Code / repository</option><option value="audio">Audio / meeting</option></select></label>
              <label><span>Expected output</span><select value={answers.outputType} onChange={(event) => update('outputType', event.target.value)}><option value="brief">Brief or answer</option><option value="document">Edited document</option><option value="presentation">Presentation</option><option value="analysis">Data analysis</option><option value="code">Code change</option><option value="action-log">Action log</option></select></label>
            </div>
          </section>

          <section className="form-section" aria-labelledby="requirements-heading">
            <div className="form-section-title"><span>02</span><div><h2 id="requirements-heading">Requirements</h2><p>Select every condition the result must support.</p></div></div>
            <div className="toggle-grid">
              {yesNoFields.map((field) => (
                <label className="toggle-card" key={field.key}>
                  <input type="checkbox" checked={answers[field.key]} onChange={(event) => update(field.key, event.target.checked)} />
                  <span className="fake-checkbox"><Check size={15} /></span>
                  <span><strong>{field.label}</strong><small>{field.help}</small></span>
                </label>
              ))}
            </div>
          </section>

          <section className="form-section" aria-labelledby="constraints-heading">
            <div className="form-section-title"><span>03</span><div><h2 id="constraints-heading">Environment & constraints</h2><p>Account context can change both capability and data protection.</p></div></div>
            <div className="form-grid two-col">
              <label><span>Preferred ecosystem</span><select value={answers.ecosystem} onChange={(event) => update('ecosystem', event.target.value as Ecosystem)}><option value="none">No preference</option><option value="microsoft">Microsoft 365</option><option value="google">Google Workspace</option><option value="github">GitHub / coding</option></select></label>
              <label><span>Cost / access</span><select value={answers.access} onChange={(event) => update('access', event.target.value as FinderAnswers['access'])}><option value="any">Any available option</option><option value="free">No additional paid license</option><option value="vt">VT-provided account</option><option value="paid">Paid plan available</option></select></label>
            </div>
            <fieldset className="sensitivity-fieldset">
              <legend>Data sensitivity</legend>
              <p className="field-help">These plain-language choices route to VT’s authoritative risk standard; they do not replace formal classification.</p>
              <div className="sensitivity-options">
                {[
                  { value: 'public', label: 'Public', help: 'Published or intentionally public; comparable to low-risk data.' },
                  { value: 'internal', label: 'Internal', help: 'Nonpublic operational, student, or research material; may be moderate risk.' },
                  { value: 'restricted', label: 'Restricted', help: 'High-risk, regulated, contractual, or sensitive material.' },
                  { value: 'unknown', label: 'I’m not sure', help: 'Classification or upload permission is unclear.' },
                ].map((option) => <label key={option.value}><input type="radio" name="sensitivity" value={option.value} checked={answers.sensitivity === option.value} onChange={() => update('sensitivity', option.value as FinderAnswers['sensitivity'])} /><span><strong>{option.label}</strong><small>{option.help}</small></span></label>)}
              </div>
            </fieldset>
          </section>
          <div className="form-submit"><p><ShieldCheck size={18} />No task data leaves this browser. The recommender runs locally.</p><button className="button" type="submit">Build my recommendation <ArrowRight size={18} /></button></div>
        </form>

        <aside className="finder-aside"><p className="eyebrow">How matching works</p><h2>Safety, then fit</h2><ol><li><span>1</span><div><strong>Hard safety filter</strong><p>Remove products outside the current data and account boundary.</p></div></li><li><span>2</span><div><strong>Transparent points</strong><p>Apply visible additions and deductions—never a hidden quality score.</p></div></li><li><span>3</span><div><strong>Human handoff</strong><p>Return a workflow, trade-offs, sources, and checks.</p></div></li></ol><Link to="/methodology">Read full methodology <ArrowRight size={15} /></Link></aside>
      </div>

      {result && (
        <section id="recommendation-results" className="results-section" tabIndex={-1} aria-live="polite">
          <div className="container">
            <div className="section-heading"><p className="eyebrow">Your recommendation</p><h2>{result.halted ? 'Pause: classify the data first' : 'A best fit—with visible trade-offs'}</h2></div>
            <SafetyCallout title={result.halted ? 'Do not upload yet' : 'Data boundary'}><p>{result.safetyMessage}</p></SafetyCallout>
            {result.halted ? (
              <div className="halt-card"><CircleAlert /><div><h3>Use a human-only path for now</h3><p>Remove or classify the data, consult the responsible data steward or policy owner, then return to this finder.</p><Link to="/safety" className="button button-small">Review safety guidance</Link></div></div>
            ) : result.primary && (
              <>
                {result.closeCall && <div className="close-call"><strong>Close call:</strong> the top two tools are within two points. Treat the differences below as a choice, not a universal winner.</div>}
                <div className="result-grid"><ToolResultCard item={result.primary} primary />{result.alternatives.map((item) => <ToolResultCard item={item} key={item.tool.id} />)}</div>
                <div className="recommendation-next-grid">
                  {result.workflowSkill && <article className="next-card"><p className="eyebrow">Workflow skill</p><h3>{result.workflowSkill.name}</h3><p>{result.workflowSkill.summary}</p><Link to={`/skills/${result.workflowSkill.slug}`}>Open the complete skill <ArrowRight size={16} /></Link></article>}
                  {result.installableSkill && <article className="next-card permission-card"><p className="eyebrow">Optional installable skill</p><h3>{result.installableSkill.name}</h3><p>{result.installableSkill.summary}</p><p><strong>No automatic install.</strong> Review publisher, license, permissions, and source first.</p><Link to={`/skills/${result.installableSkill.slug}`}>Review permissions <ArrowRight size={16} /></Link></article>}
                  <article className="next-card checklist-card"><p className="eyebrow">Human verification</p><h3>Before you use the output</h3><ul>{result.humanChecklist.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></article>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  )
}
