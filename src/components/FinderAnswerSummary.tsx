import { taskById } from '../data/tasks'
import type { FinderAnswers } from '../types'

const roleLabels: Record<string, string> = { student: 'Student', faculty: 'Faculty', staff: 'Staff', researcher: 'Researcher' }
const collaborationLabels: Record<string, string> = { individual: 'Individual work', 'shared-workspace': 'Shared AI workspace', 'document-coauthoring': 'Document coauthoring', 'repository-collaboration': 'Repository collaboration', 'organization-account': 'Organization-managed workspace' }

export function FinderAnswerSummary({ answers }: { answers: FinderAnswers }) {
  const requirements = [answers.needsWeb && 'current web', answers.citations && 'source trail', answers.editFiles && 'file editing', answers.coding && 'code work'].filter(Boolean)
  return <section className="answer-summary" aria-labelledby="answer-summary-title"><p className="eyebrow">Your brief</p><h3 id="answer-summary-title">Finder answer summary</h3><dl><div><dt>Role & task</dt><dd>{roleLabels[answers.role]} · {taskById[answers.taskId]?.name}</dd></div><div><dt>Input → output</dt><dd>{answers.inputType} → {answers.outputType}</dd></div><div><dt>Requirements</dt><dd>{requirements.length ? requirements.join(', ') : 'No additional capabilities selected'}</dd></div><div><dt>Work setting</dt><dd>{collaborationLabels[answers.collaborationMode]} · {answers.ecosystem === 'none' ? 'no ecosystem preference' : answers.ecosystem}</dd></div><div><dt>Boundary</dt><dd>{answers.sensitivity} data · {answers.access} access</dd></div></dl></section>
}
