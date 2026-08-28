import { ArrowRight, Filter, Search, ShieldCheck, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, PageHeader, RiskBadge, StatusBadge } from '../components/Shared'
import { skills } from '../data/skills'
import { tools } from '../data/tools'
import { ui } from '../i18n/en'
import { filterSkills, type SkillFilters } from '../lib/filters'
import { displayStatus, validateSkill } from '../lib/validation'

const initialFilters: SkillFilters = { search: '', category: '', role: '', tool: '', type: '', inputType: '', risk: '', web: '', permission: '' }
const categories = [...new Set(skills.map((skill) => skill.category))]
const inputTypes = [...new Set(skills.flatMap((skill) => skill.inputTypes))]

export function SkillsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const visible = useMemo(() => filterSkills(skills, filters), [filters])
  const update = (key: keyof SkillFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }))
  const filterCount = Object.values(filters).filter(Boolean).length

  return (
    <>
      <PageHeader {...ui.pageHeaders.skills}>
        <div className="header-inline-note"><ShieldCheck size={17} />Installable skills are explained here, never installed automatically.</div>
      </PageHeader>
      <div className="container library-layout">
        <aside className="filter-panel" aria-label="Skill filters">
          <div className="filter-panel-heading"><div><Filter size={18} /><h2>Filter skills</h2></div>{filterCount > 0 && <button type="button" onClick={() => setFilters(initialFilters)}>Reset</button>}</div>
          <label><span>Search</span><div className="input-with-icon"><Search size={16} /><input type="search" placeholder="Skill name or problem" value={filters.search} onChange={(event) => update('search', event.target.value)} /></div></label>
          <label><span>Task category</span><select value={filters.category} onChange={(event) => update('category', event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>User role</span><select value={filters.role} onChange={(event) => update('role', event.target.value)}><option value="">All roles</option><option value="student">Student</option><option value="faculty">Faculty</option><option value="researcher">Researcher</option><option value="staff">Staff</option></select></label>
          <label><span>Compatible AI</span><select value={filters.tool} onChange={(event) => update('tool', event.target.value)}><option value="">Any tool</option>{tools.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}</select></label>
          <label><span>Skill type</span><select value={filters.type} onChange={(event) => update('type', event.target.value)}><option value="">Both types</option><option value="workflow">Workflow skill</option><option value="installable">Installable skill / plugin</option></select></label>
          <label><span>Input type</span><select value={filters.inputType} onChange={(event) => update('inputType', event.target.value)}><option value="">Any input</option>{inputTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Risk level</span><select value={filters.risk} onChange={(event) => update('risk', event.target.value)}><option value="">Any risk</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
          <label><span>Needs internet</span><select value={filters.web} onChange={(event) => update('web', event.target.value)}><option value="">Either</option><option value="true">Yes</option><option value="false">No</option></select></label>
          <label><span>Permissions</span><select value={filters.permission} onChange={(event) => update('permission', event.target.value)}><option value="">Any</option><option value="auth">Needs authorization</option><option value="code">Executes code</option></select></label>
        </aside>

        <section className="library-results" aria-labelledby="skill-results-heading">
          <div className="results-meta"><p id="skill-results-heading"><strong>{visible.length}</strong> of {skills.length} skills</p>{filterCount > 0 && <span>{filterCount} active {filterCount === 1 ? 'filter' : 'filters'}</span>}</div>
          {filterCount > 0 && <div className="active-filter-row">{Object.entries(filters).filter(([, value]) => value).map(([key, value]) => <button type="button" key={key} onClick={() => update(key as keyof SkillFilters, '')}>{value}<X size={13} /><span className="sr-only">Remove {key} filter</span></button>)}</div>}
          {visible.length === 0 ? <EmptyState title="No skills match">Remove one or more filters to broaden the library.</EmptyState> : (
            <div className="skill-list">
              {visible.map((skill) => {
                const status = displayStatus(skill.status, validateSkill(skill))
                return (
                  <article className="skill-card" key={skill.id}>
                    <div className="skill-card-main">
                      <div className="skill-meta"><span className={`type-badge type-${skill.type}`}>{skill.type === 'workflow' ? 'Workflow skill' : 'Installable skill'}</span><RiskBadge risk={skill.risk} /><StatusBadge status={status} /></div>
                      <p className="card-eyebrow">{skill.category}</p><h2><Link to={`/skills/${skill.slug}`}>{skill.name}</Link></h2><p>{skill.summary}</p>
                      <dl><div><dt>Input</dt><dd>{skill.inputTypes.slice(0, 3).join(' · ')}</dd></div><div><dt>Works with</dt><dd>{skill.compatibleTools.slice(0, 3).map((id) => tools.find((tool) => tool.id === id)?.name ?? id).join(' · ')}</dd></div></dl>
                    </div>
                    <div className="skill-card-side"><div><span>Internet</span><strong>{skill.requiresWeb ? 'Required' : 'Not required'}</strong></div><div><span>Authorization</span><strong>{skill.requiresAuth ? 'Required' : 'No'}</strong></div><div><span>Code execution</span><strong>{skill.executesCode ? 'Possible' : 'No'}</strong></div><Link to={`/skills/${skill.slug}`}>Open skill <ArrowRight size={16} /></Link></div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
      <section className="container find-skill-cta"><div><p className="eyebrow">Nothing quite fits?</p><h2>Learn how to evaluate the next skill safely.</h2><p>Use publisher, source code, permissions, maintenance, licensing, and a low-risk test—not stars alone.</p></div><Link to="/find-a-skill" className="button">Find and evaluate a skill <ArrowRight size={18} /></Link></section>
    </>
  )
}
