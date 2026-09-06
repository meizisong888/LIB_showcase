import type { VerifiedCapability } from '../types'

export const capabilityLabels: Record<VerifiedCapability, string> = {
  'general-chat': 'General chat',
  drafting: 'Drafting',
  revising: 'Writing revision',
  summarization: 'Summarization',
  'source-grounding': 'Answers from supplied sources',
  'file-upload': 'File upload',
  coding: 'Coding',
  'api-access': 'API access',
  'web-search': 'Web search',
  citations: 'Citations or source links',
  'multimodal-input': 'Multimodal input',
  'image-generation': 'Image generation',
  'dedicated-instance': 'Dedicated high-throughput instance',
}
