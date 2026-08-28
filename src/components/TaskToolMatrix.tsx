import { ChevronDown } from 'lucide-react'
import { SourceLinks } from './Shared'
import { tasks } from '../data/tasks'
import { tools } from '../data/tools'
import { capabilityDisclaimer, fitDescriptions, fitLabels, fitSymbols } from '../lib/toolFit'

function FitCell({ toolId, taskId }: { toolId: string; taskId: string }) {
  const fit = tools.find((tool) => tool.id === toolId)?.taskFit[taskId] ?? 'not-focused'
  return <span className={`matrix-fit fit-${fit}`} title={fitDescriptions[fit]} aria-label={`${fitLabels[fit]} fit. ${fitDescriptions[fit]}`}><span aria-hidden="true">{fitSymbols[fit]}</span>{fitLabels[fit]}</span>
}

export function TaskToolMatrix() {
  const allSourceIds = [...new Set(tools.flatMap((tool) => tool.sourceIds))]
  return <section className="matrix-section" aria-labelledby="matrix-title"><div className="section-heading split-heading"><div><p className="eyebrow">Capability map</p><h2 id="matrix-title">Task × tool matrix</h2></div><p>{capabilityDisclaimer}</p></div><div className="matrix-legend" aria-label="Fit legend">{(['strong', 'capable', 'conditional', 'not-focused'] as const).map((fit) => <span key={fit} className={`fit-${fit}`}><b aria-hidden="true">{fitSymbols[fit]}</b>{fitLabels[fit]}</span>)}</div><div className="table-scroll matrix-desktop" tabIndex={0}><table className="task-tool-matrix"><caption>Documented capability fit for eight tasks and eight products</caption><thead><tr><th scope="col">Task</th>{tools.map((tool) => <th scope="col" key={tool.id}>{tool.name}</th>)}</tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><th scope="row">{task.name}</th>{tools.map((tool) => <td key={tool.id}><FitCell toolId={tool.id} taskId={task.id} /></td>)}</tr>)}</tbody></table></div><div className="matrix-mobile">{tasks.map((task, index) => <details key={task.id} open={index === 0}><summary>{task.name}<ChevronDown aria-hidden="true" /></summary><ul>{tools.map((tool) => <li key={tool.id}><span>{tool.name}</span><FitCell toolId={tool.id} taskId={task.id} /></li>)}</ul></details>)}</div><div className="matrix-evidence"><p>Profiles checked {tools[0]?.verifiedAt}. Hover or focus a fit label for its definition.</p><details><summary>Matrix evidence register ({allSourceIds.length} sources)</summary><SourceLinks sourceIds={allSourceIds} compact /></details></div></section>
}
