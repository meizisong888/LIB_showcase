import { taskById } from '../data/tasks'
import type { FinderAnswers } from '../types'

const sensitivityLabels: Record<FinderAnswers['sensitivity'], string> = {
  public: 'Public',
  internal: 'Internal university information',
  sensitive: 'Sensitive or high-risk university information',
  controlled: 'Export-controlled data or CUI',
}

export function FinderAnswerSummary({ answers }: { answers: FinderAnswers }) {
  return <section className="answer-summary" aria-labelledby="answer-summary-title"><p className="eyebrow">Your requirements</p><h3 id="answer-summary-title">Recommendation brief</h3><dl><div><dt>Task</dt><dd>{taskById[answers.taskId]?.name}</dd></div><div><dt>Based on your sources</dt><dd>{answers.requiresProvidedSources ? 'Required' : 'Not required'}</dd></div><div><dt>File upload</dt><dd>{answers.needsFileUpload ? 'Required' : 'Not required'}</dd></div><div><dt>Programming or API</dt><dd>{answers.needsProgrammingOrApi ? 'Required' : 'Not required'}</dd></div><div><dt>Data</dt><dd>{sensitivityLabels[answers.sensitivity]}</dd></div><div><dt>ARC account</dt><dd>{answers.hasArcAccount ? 'Yes' : 'No'}</dd></div></dl></section>
}
