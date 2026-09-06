import type { Task } from '../types'

export const tasks: Task[] = [
  { id: 'brainstorming-writing', shortName: 'Brainstorm & write', name: 'Brainstorming / general writing', summary: 'Generate ideas, outlines, or a first draft.' },
  { id: 'revising-writing', shortName: 'Revise writing', name: 'Revising or improving writing', summary: 'Improve clarity, organization, grammar, or style.' },
  { id: 'summarizing-readings', shortName: 'Summarize readings', name: 'Summarizing course readings', summary: 'Condense assigned material while preserving key ideas.' },
  { id: 'source-questions', shortName: 'Ask about sources', name: 'Asking questions based on uploaded sources', summary: 'Get answers grounded in material you provide.' },
  { id: 'coding-debugging', shortName: 'Code & debug', name: 'Coding and debugging', summary: 'Explain, draft, or troubleshoot code.' },
  { id: 'research-api', shortName: 'Research & API', name: 'Research or API experimentation', summary: 'Explore a research question or build an API-based experiment.' },
  { id: 'image-multimodal', shortName: 'Image & multimodal', name: 'Image or multimodal work', summary: 'Work with images, voice, vision, or image generation.' },
  { id: 'quick-questions', shortName: 'Quick questions', name: 'Quick general questions', summary: 'Get concise help with an everyday question.' },
]

export const taskById = Object.fromEntries(tasks.map((task) => [task.id, task])) as Record<string, Task>
