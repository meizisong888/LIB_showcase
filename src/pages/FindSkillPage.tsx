import { ArrowRight, BadgeCheck, Boxes, CodeXml, FlaskConical, GitBranch, KeyRound, RefreshCcw, Scale, SearchCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, SafetyCallout } from '../components/Shared'
import { SkillEvaluationChecklist } from '../components/SkillEvaluationChecklist'
import { ui } from '../i18n/en'

const steps = [
  { icon: SearchCheck, title: 'Define the job and output', text: 'Write the task, expected artifact, acceptance criteria, non-goals, data class, and required human owner before searching.' },
  { icon: BadgeCheck, title: 'Start with official or curated sources', text: 'Prefer the product publisher, a trusted institutional catalog, or a curated collection with review criteria and dates.' },
  { icon: GitBranch, title: 'Verify publisher and source code', text: 'Match the marketplace publisher to the repository owner. Inspect release provenance, install scripts, and whether source is available.' },
  { icon: KeyRound, title: 'Map every permission', text: 'List file scope, network destinations, command execution, environment variables, account scopes, tokens, and any transitive MCP or plugin access.' },
  { icon: RefreshCcw, title: 'Check maintenance and compatibility', text: 'Review the last release, open security issues, supported versions, deprecation notices, ownership changes, and response to reports.' },
  { icon: Scale, title: 'Read the license and examples', text: 'Confirm the license permits your use. Look for a reproducible task and expected output—not a star count or polished demo alone.' },
  { icon: FlaskConical, title: 'Test with low-risk data', text: 'Use a clean branch, synthetic files, isolated account, restricted network, and the smallest practical permission set.' },
  { icon: Boxes, title: 'Plan stop, rollback, and handoff', text: 'Know how to revoke tokens, remove the integration, revert changes, preserve logs, and move the work to a human.' },
]

export function FindSkillPage() {
  return (
    <>
      <PageHeader {...ui.pageHeaders.findSkill} />
      <section className="container section"><SkillEvaluationChecklist /></section>
      <section className="container section source-tiers">
        <div className="section-heading"><p className="eyebrow">Source labels</p><h2>Where a listing comes from changes what you know</h2></div>
        <div className="tier-grid"><article><span className="tier official">Official</span><h3>Published by the product owner</h3><p>Best for current installation, permissions, compatibility, terms, and security notices. Official does not mean risk-free.</p></article><article><span className="tier curated">Curated</span><h3>Reviewed against stated criteria</h3><p>Useful when the curator shows scope, evidence, reviewers, dates, and removal criteria. Re-check upstream facts.</p></article><article><span className="tier community">Community</span><h3>Shared by an individual or group</h3><p>Can be valuable, but provenance and review vary. Treat forks, copied prompts, and install scripts as new artifacts.</p></article></div>
      </section>
      <section className="evaluation-steps section"><div className="container"><details><summary><span><span className="eyebrow">Detailed method</span><strong>Eight steps from task definition to reversible test</strong></span></summary><p>A later safety check cannot undo data already exposed during installation or authorization.</p><ol>{steps.map((step, index) => { const Icon = step.icon; return <li key={step.title}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><span className="step-icon"><Icon /></span><div><h3>{step.title}</h3><p>{step.text}</p></div></li> })}</ol></details></div></section>
      <section className="container section permission-matrix"><div className="section-heading"><p className="eyebrow">Permission worksheet</p><h2>Ask what the skill can reach—not only what it promises</h2></div><div className="table-scroll" tabIndex={0}><table><caption>Permission questions and low-risk test controls</caption><thead><tr><th scope="col">Surface</th><th scope="col">Questions</th><th scope="col">First-test control</th></tr></thead><tbody><tr><th scope="row">Files</th><td>Which folders? Read, write, rename, or delete? Does scope persist?</td><td>A disposable folder with synthetic files.</td></tr><tr><th scope="row">Network</th><td>Which domains, APIs, telemetry, model providers, or downloads?</td><td>Block by default; allow named endpoints only.</td></tr><tr><th scope="row">Commands</th><td>Can it run a shell, install packages, start processes, or change git?</td><td>Container or clean branch; approve each command.</td></tr><tr><th scope="row">Accounts</th><td>Which OAuth scopes, organizations, repos, mailboxes, or drives?</td><td>Test account with one low-risk resource.</td></tr><tr><th scope="row">Secrets</th><td>Can it read environment variables, config files, keychains, or logs?</td><td>No production secrets; short-lived scoped token.</td></tr><tr><th scope="row">Dependencies</th><td>What packages, MCP servers, extensions, or update channels are added?</td><td>Pin and inspect the complete dependency path.</td></tr></tbody></table></div></section>
      <section className="container section"><SafetyCallout title="Stars are a discovery signal, not a safety review"><p>Popularity can reveal adoption, but it does not prove publisher identity, secure permissions, accurate output, active maintenance, license compatibility, or fitness for Virginia Tech data.</p></SafetyCallout></section>
      <section className="container evaluate-cta"><CodeXml /><div><p className="eyebrow">Practice on a concrete example</p><h2>Review an installable coding skill card</h2><p>See publisher, official source, license, platforms, file/network/command access, maintenance, and security notes together.</p></div><Link className="button" to="/skills/github-copilot-agent-mode">Open example <ArrowRight size={18} /></Link></section>
    </>
  )
}
