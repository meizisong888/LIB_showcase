import type { Scenario } from '../types'

export const scenarios: Scenario[] = [
  {
    id: 'student-source-brief', role: 'student', title: 'Build a source-backed course brief',
    situation: 'A student needs a current evidence map before writing their own course assignment.', sensitivity: 'public', targetOutput: 'Evidence brief', toolFamily: 'research', skillSlug: 'citation-verification',
    biggestRisk: 'Treating a linked citation as proof without opening the source.', humanChecks: ['Follow the instructor’s AI-use rules.', 'Open every source and write the final argument yourself.'],
    answers: { role: 'student', taskId: 'research', inputType: 'text', outputType: 'brief', needsWeb: true, citations: true, editFiles: false, coding: false, collaborationMode: 'individual', ecosystem: 'none', sensitivity: 'public', access: 'free' },
  },
  {
    id: 'faculty-lesson', role: 'faculty', title: 'Review a lesson and AI-use directions',
    situation: 'A faculty member is turning approved course context into an accessible classroom activity.', sensitivity: 'internal', targetOutput: 'Teaching document', toolFamily: 'office', skillSlug: 'lesson-design-review',
    biggestRisk: 'Exposing student records or producing instructions that undermine the learning objective.', humanChecks: ['Remove identifiable student information.', 'Test rubric alignment and accessibility.'],
    answers: { role: 'faculty', taskId: 'teaching', inputType: 'documents', outputType: 'document', needsWeb: false, citations: false, editFiles: true, coding: false, collaborationMode: 'document-coauthoring', ecosystem: 'google', sensitivity: 'internal', access: 'vt' },
  },
  {
    id: 'staff-actions', role: 'staff', title: 'Turn approved notes into an action log',
    situation: 'A staff team needs decisions, owners, due dates, and open questions from approved meeting notes.', sensitivity: 'internal', targetOutput: 'Decision and action log', toolFamily: 'office', skillSlug: 'meeting-action-log',
    biggestRisk: 'Inferring agreement, ownership, or dates that were never confirmed.', humanChecks: ['Confirm consent and recipient access.', 'Have the meeting owner approve every assignment.'],
    answers: { role: 'staff', taskId: 'meetings', inputType: 'documents', outputType: 'action-log', needsWeb: false, citations: false, editFiles: true, coding: false, collaborationMode: 'organization-account', ecosystem: 'microsoft', sensitivity: 'internal', access: 'vt' },
  },
  {
    id: 'researcher-audit', role: 'researcher', title: 'Audit a reproducible data analysis',
    situation: 'A researcher wants a staged quality check and code plan before running analysis on restricted data.', sensitivity: 'restricted', targetOutput: 'Analysis memo and reviewed code', toolFamily: 'general', skillSlug: 'data-analysis-audit',
    biggestRisk: 'Uploading data before confirming protocol, contract, and data-steward requirements.', humanChecks: ['Use synthetic data for the first pass.', 'Confirm PI, IRB, contract, and reproducibility requirements.'],
    answers: { role: 'researcher', taskId: 'data-analysis', inputType: 'spreadsheets', outputType: 'analysis', needsWeb: false, citations: false, editFiles: false, coding: true, collaborationMode: 'organization-account', ecosystem: 'none', sensitivity: 'restricted', access: 'vt' },
  },
]
