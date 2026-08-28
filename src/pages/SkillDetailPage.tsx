import { AlertTriangle, ArrowLeft, Check, Clipboard, Copy, ExternalLink, FileKey, ShieldAlert, Terminal } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RiskBadge, SourceLinks, StatusBadge } from '../components/Shared'
import { skillBySlug } from '../data/skills'
import { toolById } from '../data/tools'
import { displayStatus, validateSkill } from '../lib/validation'
import { NotFoundPage } from './NotFoundPage'

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Fall through for browsers or embedded previews that deny Clipboard API permission.
    }
  }
  const area = document.createElement('textarea')
  area.value = value
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  area.remove()
}

export function SkillDetailPage() {
  const { slug } = useParams()
  const skill = slug ? skillBySlug[slug] : undefined
  const [copied, setCopied] = useState(false)
  if (!skill) return <NotFoundPage />

  const status = displayStatus(skill.status, validateSkill(skill))
  const handleCopy = async () => {
    await copyText(skill.prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      <header className="skill-detail-header">
        <div className="container">
          <Link className="back-link" to="/skills"><ArrowLeft size={16} />Back to skills</Link>
          <div className="skill-detail-title">
            <div>
              <div className="skill-meta"><span className={`type-badge type-${skill.type}`}>{skill.type === 'workflow' ? 'Workflow skill' : 'Installable skill / plugin'}</span><RiskBadge risk={skill.risk} /><StatusBadge status={status} /></div>
              <p className="eyebrow">{skill.category}</p><h1>{skill.name}</h1><p>{skill.summary}</p>
            </div>
            <dl><div><dt>Last verified</dt><dd>{skill.verifiedAt}</dd></div><div><dt>Source tier</dt><dd>{skill.sourceTier}</dd></div><div><dt>Skill ID</dt><dd>{skill.id}</dd></div></dl>
          </div>
        </div>
      </header>
      <div className="container skill-detail-layout">
        <main className="skill-content">
          <section><p className="section-label">The problem</p><h2>What this skill solves</h2><p className="large-copy">{skill.problem}</p></section>
          <section className="when-grid">
            <div className="use-box"><h2><Check />Use it when</h2><ul>{skill.useWhen.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="avoid-box"><h2><AlertTriangle />Do not use it when</h2><ul>{skill.avoidWhen.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </section>
          <section><p className="section-label">Prepare</p><h2>Inputs you need</h2><ol className="number-list compact-list">{skill.inputs.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>)}</ol></section>
          <section><p className="section-label">Run the workflow</p><h2>Standard steps</h2><ol className="number-list">{skill.steps.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item}</strong></div></li>)}</ol></section>
          <section className="prompt-section"><div className="prompt-heading"><div><p className="section-label">Reusable template</p><h2>Copy the prompt</h2></div><button type="button" className={copied ? 'copy-button copied' : 'copy-button'} onClick={handleCopy}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Copied' : 'Copy prompt'}</button></div><pre><code>{skill.prompt}</code></pre><p className="copy-feedback" role="status" aria-live="polite">{copied ? 'Prompt copied to your clipboard.' : 'Replace bracketed fields and remove information the tool does not need.'}</p></section>
          <section><p className="section-label">Expected result</p><h2>What good output looks like</h2><p className="large-copy">{skill.expectedOutput}</p></section>
          <section><p className="section-label">Failure awareness</p><h2>Common ways this goes wrong</h2><ul className="failure-list">{skill.failureModes.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}</ul></section>
          <section className="verification-section"><p className="section-label">Human verification</p><h2>Before you use the output</h2><ul>{skill.checklist.map((item) => <li key={item}><span><Check size={15} /></span>{item}</li>)}</ul></section>
          {skill.installable && (
            <section className="installable-section">
              <div className="permission-heading"><FileKey /><div><p className="section-label">Permission review</p><h2>Installable skill details</h2></div></div>
              <p>This site does not install or authorize this software. Re-check these fields at the official source before every installation.</p>
              <dl className="installable-grid">
                <div><dt>Publisher</dt><dd>{skill.installable.publisher}</dd></div>
                <div><dt>Source</dt><dd><a href={skill.installable.repositoryUrl} target="_blank" rel="noreferrer">Official page <ExternalLink size={14} /></a></dd></div>
                <div><dt>License</dt><dd>{skill.installable.license}</dd></div>
                <div><dt>Platforms</dt><dd>{skill.installable.platforms.join(', ')}</dd></div>
                <div><dt>Requested permissions</dt><dd><ul>{skill.installable.permissions.map((item) => <li key={item}>{item}</li>)}</ul></dd></div>
                <div><dt>Access surface</dt><dd><span className={skill.installable.networkAccess ? 'permission yes' : 'permission'}>Network: {skill.installable.networkAccess ? 'yes' : 'no'}</span><span className={skill.installable.fileAccess ? 'permission yes' : 'permission'}>Files: {skill.installable.fileAccess ? 'yes' : 'no'}</span><span className={skill.installable.commandAccess ? 'permission yes' : 'permission'}>Commands: {skill.installable.commandAccess ? 'yes' : 'no'}</span></dd></div>
                <div><dt>Maintenance</dt><dd>{skill.installable.maintenanceStatus}</dd></div>
                <div><dt>Security notes</dt><dd>{skill.installable.securityNotes}</dd></div>
              </dl>
            </section>
          )}
          <section><SourceLinks sourceIds={skill.sourceIds} /></section>
        </main>
        <aside className="skill-detail-aside">
          <div><h2>At a glance</h2><dl><div><dt>Internet</dt><dd>{skill.requiresWeb ? 'Required' : 'Not required'}</dd></div><div><dt>Authorization</dt><dd>{skill.requiresAuth ? 'Required' : 'No'}</dd></div><div><dt>Code execution</dt><dd>{skill.executesCode ? 'Possible' : 'No'}</dd></div><div><dt>Inputs</dt><dd>{skill.inputTypes.join(', ')}</dd></div><div><dt>Outputs</dt><dd>{skill.outputTypes.join(', ')}</dd></div></dl></div>
          <div><h2>Recommended AI</h2><ul className="aside-tool-list">{skill.compatibleTools.map((id) => toolById[id]).filter(Boolean).map((tool) => <li key={tool.id}><strong>{tool.name}</strong><span>{tool.category}</span></li>)}</ul><Link to="/tools">Compare these tools</Link></div>
          <div className="aside-safety"><ShieldAlert /><h2>Data & permissions</h2><p>{skill.safety}</p><Link to="/safety">Review responsible AI guidance</Link></div>
          <div><h2>Related skills</h2>{skill.alternatives.map((item) => skillBySlug[item]).filter(Boolean).map((item) => <Link className="related-skill" key={item.slug} to={`/skills/${item.slug}`}><Clipboard size={16} /><span><strong>{item.name}</strong><small>{item.type}</small></span></Link>)}</div>
          {skill.executesCode && <div className="command-warning"><Terminal /><p>Inspect every command before execution. A generated command can be syntactically valid and still be unsafe.</p></div>}
        </aside>
      </div>
    </>
  )
}
