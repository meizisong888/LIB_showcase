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
import type { FinderAnswers } from '../types'

const requirementFields = [
  { key: 'requiresProvidedSources', label: 'Must the answer be based on material you provide?', help: 'This becomes a hard requirement for a verified source-grounded workflow.' },
  { key: 'needsFileUpload', label: 'Do you need to upload a file?', help: 'Tools without an explicitly verified upload capability are removed.' },
  { key: 'needsProgrammingOrApi', label: 'Do you need programming or API access?', help: 'The selected task determines whether coding or API support is required.' },
] as const

const dataOptions: Array<{ value: FinderAnswers['sensitivity']; label: string; help: string }> = [
  { value: 'public', label: 'Public', help: 'Published or intentionally public information.' },
  { value: 'internal', label: 'Internal university information', help: 'Nonpublic information used within Virginia Tech.' },
  { value: 'sensitive', label: 'Sensitive or high-risk university information', help: 'Regulated or high-risk data, subject to any additional rules.' },
  { value: 'controlled', label: 'Export-controlled data or CUI', help: 'VT prohibits this data in every AI tool.' },
]

export function RecommendPage() {
  const [searchParams] = useSearchParams()
  const initialAnswers = useMemo(() => searchParams.size ? finderAnswersFromSearchParams(searchParams) : defaultFinderAnswers, [searchParams])
  const [answers, setAnswers] = useState<FinderAnswers>(initialAnswers)
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

  return <>
    <PageHeader {...ui.pageHeaders.recommend} />
    <div className="container finder-layout">
      <form className="finder-form" onSubmit={submit}>
        <section className="form-section" aria-labelledby="task-heading"><div className="form-section-title"><span>01</span><div><h2 id="task-heading">What are you trying to do?</h2><p>Choose the closest task. This is used only after every hard filter passes.</p></div></div><fieldset className="task-fieldset"><legend className="sr-only">Task</legend><div className="task-options">{tasks.map((task) => <label key={task.id}><input type="radio" name="task" value={task.id} checked={answers.taskId === task.id} onChange={() => update('taskId', task.id)} /><span><strong>{task.name}</strong><small>{task.summary}</small></span></label>)}</div></fieldset></section>

        <section className="form-section" aria-labelledby="requirements-heading"><div className="form-section-title"><span>02</span><div><h2 id="requirements-heading">What must the tool support?</h2><p>These answers are pass/fail requirements, not preferences.</p></div></div><div className="toggle-grid">{requirementFields.map((field) => <label className="toggle-card" key={field.key}><input type="checkbox" checked={answers[field.key]} onChange={(event) => update(field.key, event.target.checked)} /><span className="fake-checkbox"><Check size={15} aria-hidden="true" /></span><span><strong>{field.label}</strong><small>{field.help}</small></span></label>)}</div></section>

        <section className="form-section" aria-labelledby="data-heading"><div className="form-section-title"><span>03</span><div><h2 id="data-heading">What data will you use?</h2><p>Choose the highest applicable category. When unsure, pause and ask the responsible data owner.</p></div></div><fieldset className="sensitivity-fieldset"><legend className="sr-only">Data sensitivity</legend><div className="sensitivity-options">{dataOptions.map((option) => <label key={option.value}><input type="radio" name="sensitivity" value={option.value} checked={answers.sensitivity === option.value} onChange={() => update('sensitivity', option.value)} /><span><strong>{option.label}</strong><small>{option.help}</small></span></label>)}</div></fieldset></section>

        <section className="form-section" aria-labelledby="arc-heading"><div className="form-section-title"><span>04</span><div><h2 id="arc-heading">Do you already have an ARC account?</h2><p>This affects only the conditional Open OnDemand option; the ARC LLM Gateway web interface does not require a separate ARC account.</p></div></div><div className="binary-options" role="radiogroup" aria-label="ARC account"><label><input type="radio" name="arc-account" checked={!answers.hasArcAccount} onChange={() => update('hasArcAccount', false)} /><span>No</span></label><label><input type="radio" name="arc-account" checked={answers.hasArcAccount} onChange={() => update('hasArcAccount', true)} /><span>Yes, I have an ARC account</span></label></div></section>

        <div className="form-submit"><p><ShieldCheck size={18} aria-hidden="true" />Selections stay in this browser and are not uploaded.</p><button className="button" type="submit">Show verified matches <ArrowRight size={18} /></button></div>
      </form>
      <aside className="finder-aside"><p className="eyebrow">Hard filters first</p><h2>How matching works</h2><ol><li><span>1</span><div><strong>Student access</strong><p>Remove employee-only, pilot, or unmet ARC access.</p></div></li><li><span>2</span><div><strong>Data use</strong><p>Enforce VT restrictions before considering capabilities.</p></div></li><li><span>3</span><div><strong>Required features</strong><p>Remove tools missing a must-have function.</p></div></li><li><span>4</span><div><strong>Task fit</strong><p>Evaluate the documented task fit of the remaining tools.</p></div></li></ol><Link to="/responsible-use">Read the method and sources <ArrowRight size={15} /></Link></aside>
    </div>

    {result && <section id="recommendation-results" className="results-section" tabIndex={-1} aria-live="polite"><div className="container"><div className="section-heading"><p className="eyebrow">Recommendation result</p><h2>{result.halted ? result.message : result.message}</h2></div><FinderAnswerSummary answers={answers} /><SafetyCallout title={answers.sensitivity === 'controlled' ? 'Do not use an AI tool for this data' : 'Data boundary'}><p>{result.safetyMessage}</p>{answers.sensitivity === 'controlled' && <a href="https://ai.vt.edu/tools.html" target="_blank" rel="noreferrer">Read the VT restriction ↗</a>}</SafetyCallout><RecommendationBreakdown result={result} /></div></section>}
  </>
}
