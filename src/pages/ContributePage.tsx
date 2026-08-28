import { AlertOctagon, ArrowRight, Clock3, GitPullRequest, Lightbulb, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/Shared'
import { ui } from '../i18n/en'

const issueUrl = 'https://github.com/meizisong888/LIB_showcase/issues/new'

export function ContributePage() {
  return (
    <>
      <PageHeader {...ui.pageHeaders.contribute} />
      <section className="container contribute-grid">
        <article><span><Lightbulb /></span><p className="eyebrow">Add coverage</p><h2>Submit a tool or skill</h2><p>Provide the problem it solves, applicability boundaries, first-party sources, access conditions, and—in installable cases—complete permissions and license data.</p><a className="button button-small" href={`${issueUrl}?template=submit-tool-or-skill.yml`} target="_blank" rel="noreferrer">Open issue form <ArrowRight size={16} /></a></article>
        <article><span><Clock3 /></span><p className="eyebrow">Correct the record</p><h2>Report outdated information</h2><p>Link the current page, identify the exact claim, provide a newer authoritative source, and explain what changed and when.</p><a className="button button-small" href={`${issueUrl}?template=report-outdated.yml`} target="_blank" rel="noreferrer">Open issue form <ArrowRight size={16} /></a></article>
        <article className="safety-issue-card"><span><AlertOctagon /></span><p className="eyebrow">Reduce harm</p><h2>Report a safety concern</h2><p>Flag unsafe data guidance, permission omissions, misleading approval language, accessibility barriers, or another concrete risk. Do not include sensitive data in a public issue.</p><a className="button button-small" href={`${issueUrl}?template=report-safety-concern.yml`} target="_blank" rel="noreferrer">Open issue form <ArrowRight size={16} /></a></article>
      </section>
      <section className="container contribution-requirements"><div><GitPullRequest /><p className="eyebrow">Before you submit</p><h2>A useful contribution includes</h2></div><ul><li><strong>A precise scope</strong><span>Which task, account, plan, platform, or data boundary does the claim cover?</span></li><li><strong>An authoritative source</strong><span>Prefer VT or the product publisher; never use a search snippet as final evidence.</span></li><li><strong>A verification date</strong><span>State when you opened the canonical page and checked the claim.</span></li><li><strong>Limits and permissions</strong><span>Document when not to use it and what the workflow can access or execute.</span></li></ul></section>
      <section className="container public-warning"><ShieldAlert /><div><h2>GitHub issues are public</h2><p>Do not paste student records, personal information, security details, unpublished research, proprietary code, credentials, or incident evidence into an issue. Use the appropriate private VT reporting channel for sensitive concerns.</p></div></section>
      <section className="container section contribute-links"><Link to="/methodology">Read the methodology <ArrowRight size={16} /></Link><a href="https://github.com/meizisong888/LIB_showcase/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">Read CONTRIBUTING.md <ArrowRight size={16} /></a><a href="https://github.com/meizisong888/LIB_showcase" target="_blank" rel="noreferrer">View repository <ArrowRight size={16} /></a></section>
    </>
  )
}
