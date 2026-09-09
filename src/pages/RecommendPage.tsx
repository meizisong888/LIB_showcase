import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FinderAnswerSummary } from '../components/FinderAnswerSummary'
import { RecommendationBreakdown } from '../components/RecommendationBreakdown'
import { PageHeader, SafetyCallout } from '../components/Shared'
import { featureHelp, featureLabels, normalizeTaskProfile, profileForGoal, taskById, tasks } from '../data/tasks'
import { ui } from '../i18n/en'
import { defaultTaskProfile, taskProfileFromSearchParams } from '../lib/finderParams'
import { recommendTools, shouldAskArcQuestions } from '../lib/recommend'
import type { ProfileFeatureKey, TaskGoal, TaskProfile } from '../types'

const dataOptions: Array<{ value: TaskProfile['sensitivity']; label: string; help: string }> = [
  { value: 'public', label: 'Public', help: 'Published or intentionally public information.' },
  { value: 'internal', label: 'Internal university information', help: 'Nonpublic information used within Virginia Tech.' },
  { value: 'sensitive', label: 'Sensitive or high-risk university information', help: 'Regulated or high-risk data, subject to any additional rules.' },
  { value: 'controlled', label: 'Export-controlled data or CUI', help: 'VT prohibits this data in every AI tool.' },
]

function SelectionSummary({ label, children }: { label: string; children: string }) {
  return <p className="selection-summary" aria-live="polite"><strong>{label}</strong><span>{children}</span></p>
}

export function RecommendPage() {
  const [searchParams] = useSearchParams()
  const initialProfile = useMemo(() => searchParams.size ? taskProfileFromSearchParams(searchParams) : defaultTaskProfile, [searchParams])
  const [profile, setProfile] = useState<TaskProfile>(initialProfile)
  const [submitted, setSubmitted] = useState(false)
  const task = taskById[profile.goal]
  const featureKeys = [...task.requiredFeatures, ...task.optionalFeatures]
  const showArc = shouldAskArcQuestions(profile)
  const showResult = submitted || profile.sensitivity === 'controlled'
  const result = useMemo(() => showResult ? recommendTools(profile) : null, [profile, showResult])

  const focusResults = () => window.setTimeout(() => document.getElementById('recommendation-results')?.focus(), 0)
  const setNormalizedProfile = (next: TaskProfile) => {
    setProfile(normalizeTaskProfile(next))
    setSubmitted(false)
  }
  const changeGoal = (goal: TaskGoal) => setNormalizedProfile(profileForGoal(goal, profile.sensitivity))
  const updateFeature = (key: ProfileFeatureKey, value: boolean) => setNormalizedProfile({ ...profile, [key]: value })
  const updateSensitivity = (sensitivity: TaskProfile['sensitivity']) => {
    setProfile((current) => ({ ...current, sensitivity }))
    setSubmitted(sensitivity === 'controlled')
    if (sensitivity === 'controlled') focusResults()
  }
  const updateArcAccount = (hasArcAccount: boolean) => setNormalizedProfile({
    ...profile,
    hasArcAccount,
    hasArcAllocation: hasArcAccount ? profile.hasArcAllocation : false,
    canUseVtNetworkOrVpn: hasArcAccount ? profile.canUseVtNetworkOrVpn : false,
  })
  const updateArcAllocation = (hasArcAllocation: boolean) => setNormalizedProfile({
    ...profile,
    hasArcAllocation,
    canUseVtNetworkOrVpn: hasArcAllocation ? profile.canUseVtNetworkOrVpn : false,
  })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    focusResults()
  }

  const selectedFeatures = featureKeys.filter((key) => profile[key]).map((key) => featureLabels[key])

  return <>
    <PageHeader {...ui.pageHeaders.recommend} description={ui.description} />
    <div className="container finder-layout">
      <form className="finder-form" onSubmit={submit}>
        <section className="form-section" aria-labelledby="task-heading">
          <div className="form-section-title"><span>01</span><div><h2 id="task-heading">What are you trying to do?</h2><p>Choose the goal that best describes your task.</p></div></div>
          <fieldset className="task-fieldset"><legend className="sr-only">Task goal</legend><div className="task-options">{tasks.map((option) => <label key={option.id}><input type="radio" name="goal" value={option.id} checked={profile.goal === option.id} onChange={() => changeGoal(option.id)} /><span><strong>{option.name}</strong><small>{option.summary}</small></span></label>)}</div></fieldset>
          <SelectionSummary label="Selected goal">{task.name}</SelectionSummary>
        </section>

        <section className="form-section" aria-labelledby="requirements-heading">
          <div className="form-section-title"><span>02</span><div><h2 id="requirements-heading">Which functions are mandatory?</h2><p>Only relevant choices are shown. Every checked function is a pass/fail condition.</p></div></div>
          <div className="toggle-grid">{featureKeys.map((key) => {
            const requiredByGoal = task.requiredFeatures.includes(key)
            return <label className={`toggle-card ${requiredByGoal ? 'required-toggle' : ''}`} key={key}>
              <input type="checkbox" checked={profile[key]} disabled={requiredByGoal} onChange={(event) => updateFeature(key, event.target.checked)} />
              <span className="fake-checkbox"><Check size={15} aria-hidden="true" /></span>
              <span><strong>{featureLabels[key]}{requiredByGoal && <em>Required by goal</em>}</strong><small>{featureHelp[key]}</small></span>
            </label>
          })}</div>
          <SelectionSummary label="Required features">{selectedFeatures.length ? selectedFeatures.join(' · ') : 'No extra feature beyond documented task fit'}</SelectionSummary>
        </section>

        <section className="form-section" aria-labelledby="data-heading">
          <div className="form-section-title"><span>03</span><div><h2 id="data-heading">What data will you use?</h2><p>Choose the highest applicable category. Export-controlled data or CUI stops the recommendation immediately.</p></div></div>
          <fieldset className="sensitivity-fieldset"><legend className="sr-only">Data sensitivity</legend><div className="sensitivity-options">{dataOptions.map((option) => <label key={option.value}><input type="radio" name="sensitivity" value={option.value} checked={profile.sensitivity === option.value} onChange={() => updateSensitivity(option.value)} /><span><strong>{option.label}</strong><small>{option.help}</small></span></label>)}</div></fieldset>
          <SelectionSummary label="Selected data category">{dataOptions.find((option) => option.value === profile.sensitivity)!.label}</SelectionSummary>
        </section>

        {showArc && <section className="form-section" aria-labelledby="arc-heading">
          <div className="form-section-title"><span>04</span><div><h2 id="arc-heading">Can you meet the ARC conditions?</h2><p>These questions appear only for API or dedicated-computing workflows. The ARC LLM Gateway web interface does not require a separate ARC account.</p></div></div>
          <fieldset className="binary-fieldset"><legend>Do you already have an ARC account?</legend><div className="binary-options"><label><input type="radio" name="arc-account" checked={!profile.hasArcAccount} onChange={() => updateArcAccount(false)} /><span>No</span></label><label><input type="radio" name="arc-account" checked={profile.hasArcAccount} onChange={() => updateArcAccount(true)} /><span>Yes</span></label></div></fieldset>
          {profile.hasArcAccount && <fieldset className="binary-fieldset"><legend>Do you have an active ARC allocation with service units?</legend><div className="binary-options"><label><input type="radio" name="arc-allocation" checked={!profile.hasArcAllocation} onChange={() => updateArcAllocation(false)} /><span>No</span></label><label><input type="radio" name="arc-allocation" checked={profile.hasArcAllocation} onChange={() => updateArcAllocation(true)} /><span>Yes</span></label></div></fieldset>}
          {profile.hasArcAccount && profile.hasArcAllocation && <fieldset className="binary-fieldset"><legend>Can you connect through the VT network or VPN?</legend><div className="binary-options"><label><input type="radio" name="arc-network" checked={!profile.canUseVtNetworkOrVpn} onChange={() => setNormalizedProfile({ ...profile, canUseVtNetworkOrVpn: false })} /><span>No</span></label><label><input type="radio" name="arc-network" checked={profile.canUseVtNetworkOrVpn} onChange={() => setNormalizedProfile({ ...profile, canUseVtNetworkOrVpn: true })} /><span>Yes</span></label></div></fieldset>}
          <SelectionSummary label="ARC status">{!profile.hasArcAccount ? 'No ARC account — Open OnDemand will be excluded' : !profile.hasArcAllocation ? 'ARC account confirmed, but no active allocation — Open OnDemand will be excluded' : !profile.canUseVtNetworkOrVpn ? 'Account and allocation confirmed; network/VPN not confirmed — Open OnDemand will be excluded' : 'Account, active allocation, and VT network/VPN access confirmed'}</SelectionSummary>
        </section>}

        <div className="form-submit"><p><ShieldCheck size={18} aria-hidden="true" />Selections stay in this browser and are not uploaded.</p><button className="button" type="submit">{profile.sensitivity === 'controlled' ? 'Show official restriction' : 'Show verified matches'} <ArrowRight size={18} /></button></div>
      </form>
      <aside className="finder-aside"><h2>How matching works</h2><p>Matches must meet your access, data, and required-feature conditions. Eligible tools are compared using official task-fit evidence.</p><Link to="/tools">View tools and official sources <ArrowRight size={15} /></Link></aside>
    </div>

    {result && <section id="recommendation-results" className="results-section" tabIndex={-1} aria-live="polite"><div className="container"><div className="section-heading"><p className="eyebrow">Recommendation result</p><h2>{result.message}</h2></div><FinderAnswerSummary profile={profile} profileLabel={result.profileLabel} requirements={result.requirements} showArc={showArc} /><SafetyCallout title={profile.sensitivity === 'controlled' ? 'Do not use an AI tool for this data' : 'Data boundary'}><p>{result.safetyMessage}</p>{profile.sensitivity === 'controlled' && <a href="https://ai.vt.edu/tools.html" target="_blank" rel="noopener noreferrer">Read the VT restriction ↗</a>}</SafetyCallout><RecommendationBreakdown result={result} /></div></section>}
  </>
}
