import { Check, ChevronRight, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, PageHeader, SourceLinks, StatusBadge } from '../components/Shared'
import { tools } from '../data/tools'
import { ui } from '../i18n/en'
import { filterTools, toggleComparison } from '../lib/filters'
import { displayStatus, validateTool } from '../lib/validation'

const boolLabel = (value: boolean) => value ? 'Yes' : 'No / not verified'
const categories = [...new Set(tools.map((tool) => tool.category))]

export function ToolsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [capability, setCapability] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [limitMessage, setLimitMessage] = useState('')
  const visible = useMemo(() => filterTools(tools, { search, category, capability }), [search, category, capability])
  const compared = selected.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean) as typeof tools

  const toggle = (id: string) => {
    const next = toggleComparison(selected, id)
    if (next === selected) setLimitMessage('Comparison is limited to three tools. Remove one before adding another.')
    else { setSelected(next); setLimitMessage('') }
  }

  return (
    <>
      <PageHeader {...ui.pageHeaders.tools} />
      <section className="container tools-workspace">
        <div className="filter-bar" aria-label="Tool filters">
          <label className="search-field"><span className="sr-only">Search tools</span><Search size={18} /><input type="search" placeholder="Search tools, providers, or strengths" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <label><span className="sr-only">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span className="sr-only">Capability</span><select value={capability} onChange={(event) => setCapability(event.target.value)}><option value="">All capabilities</option><option value="web">Live web</option><option value="citations">Sources / citations</option><option value="files">File editing</option><option value="coding">Coding</option><option value="collaboration">Collaboration</option></select></label>
          {(search || category || capability) && <button type="button" className="clear-button" onClick={() => { setSearch(''); setCategory(''); setCapability('') }}><X size={16} />Clear</button>}
        </div>

        <div className="compare-tray" aria-live="polite">
          <div><strong>{selected.length}/3 selected</strong><span>{limitMessage || (selected.length ? 'Comparison table is below the cards.' : 'Choose tools to build a comparison.')}</span></div>
          <div>{compared.map((tool) => <button type="button" key={tool.id} onClick={() => toggle(tool.id)}>{tool.name}<X size={14} /><span className="sr-only">Remove from comparison</span></button>)}</div>
        </div>

        <div className="results-meta"><p><strong>{visible.length}</strong> tools match</p><span>Facts checked August 28, 2026</span></div>
        {visible.length === 0 ? <EmptyState title="No tools match">Try clearing a filter or using a broader search term.</EmptyState> : (
          <div className="tool-card-grid">
            {visible.map((tool) => {
              const isSelected = selected.includes(tool.id)
              const status = displayStatus(tool.status, validateTool(tool))
              return (
                <article className={isSelected ? 'tool-card selected' : 'tool-card'} key={tool.id}>
                  <div className="tool-card-top"><div><p className="card-eyebrow">{tool.category}</p><h2>{tool.name}</h2><span className="provider">by {tool.provider}</span></div><StatusBadge status={status} /></div>
                  <p>{tool.summary}</p>
                  <div className="tag-row">{tool.bestFor.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div>
                  <dl className="quick-specs"><div><dt>Sources</dt><dd>{tool.citations}</dd></div><div><dt>Files</dt><dd>{tool.fileEditing ? tool.fileEditingRequiresPaid ? 'Edit · licensed' : 'Edit' : 'Analyze / draft'}</dd></div><div><dt>Coding</dt><dd>{tool.coding}</dd></div><div><dt>Access</dt><dd>{tool.accessKinds.join(' / ')}</dd></div></dl>
                  <div className="vt-note"><strong>VT boundary</strong><p>{tool.vtStatus}</p></div>
                  <SourceLinks sourceIds={tool.sourceIds} compact />
                  <button className="compare-button" type="button" aria-pressed={isSelected} onClick={() => toggle(tool.id)}>{isSelected ? <><Check size={17} />Selected for comparison</> : 'Add to comparison'}</button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {compared.length > 0 && (
        <section className="comparison-section" id="comparison">
          <div className="container">
            <div className="section-heading"><p className="eyebrow">Side-by-side view</p><h2>Conditional differences</h2><p>No composite score: the most important row depends on your task and data.</p></div>
            <div className="table-scroll" tabIndex={0} aria-label="Scrollable comparison table">
              <table className="comparison-table">
                <caption>Comparison of {compared.map((tool) => tool.name).join(', ')}</caption>
                <thead><tr><th scope="col">Dimension</th>{compared.map((tool) => <th scope="col" key={tool.id}>{tool.name}<button type="button" onClick={() => toggle(tool.id)}><X size={14} /><span className="sr-only">Remove {tool.name}</span></button></th>)}</tr></thead>
                <tbody>
                  <tr><th scope="row">Best for</th>{compared.map((tool) => <td key={tool.id}><ul>{tool.bestFor.map((item) => <li key={item}>{item}</li>)}</ul></td>)}</tr>
                  <tr><th scope="row">Strengths</th>{compared.map((tool) => <td key={tool.id}><ul>{tool.strengths.map((item) => <li key={item}>{item}</li>)}</ul></td>)}</tr>
                  <tr><th scope="row">Known limits</th>{compared.map((tool) => <td key={tool.id}><ul>{tool.limitations.map((item) => <li key={item}>{item}</li>)}</ul></td>)}</tr>
                  <tr><th scope="row">Inputs → outputs</th>{compared.map((tool) => <td key={tool.id}>{tool.inputTypes.join(', ')}<ChevronRight size={14} />{tool.outputTypes.join(', ')}</td>)}</tr>
                  <tr><th scope="row">Sources & citations</th>{compared.map((tool) => <td key={tool.id}>{tool.citations}</td>)}</tr>
                  <tr><th scope="row">Long documents</th>{compared.map((tool) => <td key={tool.id}>{tool.longDocuments}</td>)}</tr>
                  <tr><th scope="row">File editing</th>{compared.map((tool) => <td key={tool.id}>{tool.fileEditing && tool.fileEditingRequiresPaid ? 'Yes — paid or separately licensed tier' : boolLabel(tool.fileEditing)}</td>)}</tr>
                  <tr><th scope="row">Coding</th>{compared.map((tool) => <td key={tool.id}>{tool.coding}</td>)}</tr>
                  <tr><th scope="row">Multimodal</th>{compared.map((tool) => <td key={tool.id}>{tool.multimodal}</td>)}</tr>
                  <tr><th scope="row">Collaboration & ecosystem</th>{compared.map((tool) => <td key={tool.id}>{tool.collaboration ? 'Collaboration supported' : 'Individual-first'} · {tool.ecosystems.join(', ')}</td>)}</tr>
                  <tr><th scope="row">Cost & access</th>{compared.map((tool) => <td key={tool.id}>{tool.access}</td>)}</tr>
                  <tr><th scope="row">Data & privacy</th>{compared.map((tool) => <td key={tool.id}>{tool.privacy}</td>)}</tr>
                  <tr><th scope="row">VT status</th>{compared.map((tool) => <td key={tool.id}>{tool.vtStatus}</td>)}</tr>
                  <tr><th scope="row">Last verified</th>{compared.map((tool) => <td key={tool.id}>{tool.verifiedAt}</td>)}</tr>
                </tbody>
              </table>
            </div>
            <p className="table-note">Need a decision? <Link to="/recommend">Use the task finder</Link> to apply your actual constraints.</p>
          </div>
        </section>
      )}
    </>
  )
}
