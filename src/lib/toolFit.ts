import type { FitLevel, ToolFamily } from '../types'

export const fitLabels: Record<FitLevel, string> = {
  strong: 'Strong',
  capable: 'Capable',
  conditional: 'Conditional',
  'not-focused': 'Not focused',
}

export const fitSymbols: Record<FitLevel, string> = {
  strong: '●',
  capable: '◐',
  conditional: '△',
  'not-focused': '—',
}

export const familyLabels: Record<ToolFamily, string> = {
  general: 'General assistant',
  research: 'Research & synthesis',
  office: 'Office & productivity',
  coding: 'Coding & repositories',
}

export const fitDescriptions: Record<FitLevel, string> = {
  strong: 'The product’s documented capabilities directly support this task.',
  capable: 'The product can support this task, with some manual assembly or verification.',
  conditional: 'Useful only for a narrower part of this task or under specific account and workflow conditions.',
  'not-focused': 'This task is outside the product’s documented focus in this guide.',
}

export const capabilityDisclaimer = 'Capability fit reflects documented product features—not an empirical quality ranking or guarantee of output quality.'
