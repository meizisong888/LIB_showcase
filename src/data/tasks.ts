import type { Task } from '../types'

export const tasks: Task[] = [
  { id: 'research', slug: 'research', name: 'Research', eyebrow: 'Discover & verify', summary: 'Find evidence, map claims, and keep a traceable source trail.', icon: 'Search', defaultOutput: 'Evidence brief', recommendedSkillSlug: 'source-triangulation' },
  { id: 'teaching', slug: 'teaching', name: 'Teaching', eyebrow: 'Design for learning', summary: 'Build activities, rubrics, and accessible course materials.', icon: 'BookOpen', defaultOutput: 'Teaching asset', recommendedSkillSlug: 'lesson-design-review' },
  { id: 'admin-writing', slug: 'admin-writing', name: 'Administrative writing', eyebrow: 'Draft with context', summary: 'Turn notes and requirements into review-ready professional writing.', icon: 'PenLine', defaultOutput: 'Reviewed draft', recommendedSkillSlug: 'administrative-draft' },
  { id: 'documents', slug: 'documents', name: 'Document processing', eyebrow: 'Extract & transform', summary: 'Summarize, compare, or restructure long source documents.', icon: 'Files', defaultOutput: 'Structured document', recommendedSkillSlug: 'document-grounded-summary' },
  { id: 'presentations', slug: 'presentations', name: 'Presentations', eyebrow: 'Shape the story', summary: 'Create an evidence-backed narrative and accessible slide plan.', icon: 'Presentation', defaultOutput: 'Slide outline', recommendedSkillSlug: 'presentation-storyboard' },
  { id: 'data-analysis', slug: 'data-analysis', name: 'Data analysis', eyebrow: 'Inspect & explain', summary: 'Profile data, test assumptions, and document reproducible findings.', icon: 'ChartNoAxesCombined', defaultOutput: 'Analysis memo', recommendedSkillSlug: 'data-analysis-audit' },
  { id: 'coding', slug: 'coding', name: 'Programming', eyebrow: 'Plan, change, verify', summary: 'Work through a bounded code change with tests and human review.', icon: 'Code2', defaultOutput: 'Tested code change', recommendedSkillSlug: 'code-change-loop' },
  { id: 'meetings', slug: 'meetings', name: 'Meeting follow-up', eyebrow: 'Capture decisions', summary: 'Convert approved notes or transcripts into actions and decisions.', icon: 'MessagesSquare', defaultOutput: 'Decision and action log', recommendedSkillSlug: 'meeting-action-log' },
]

export const taskById = Object.fromEntries(tasks.map((task) => [task.id, task]))
