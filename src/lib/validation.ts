import type { Tool } from '../types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const evidenceHosts = new Set(['ai.vt.edu', '4help.vt.edu', 'docs.arc.vt.edu'])

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateTool(tool: Tool): ValidationResult {
  const errors: string[] = []
  const requiredStrings: Array<[string, string]> = [
    ['id', tool.id], ['name', tool.name], ['status', tool.status], ['studentAvailability', tool.studentAvailability],
    ['eligibility', tool.eligibility], ['requiredAccount', tool.requiredAccount], ['accessUrl', tool.accessUrl],
    ['costOrLimits', tool.costOrLimits], ['lastVerified', tool.lastVerified],
  ]
  requiredStrings.forEach(([field, value]) => { if (!value) errors.push(`Missing ${field}.`) })
  if (!ISO_DATE.test(tool.lastVerified)) errors.push('Missing or invalid lastVerified date.')
  if (!tool.officialSources.length) errors.push('At least one official source is required.')
  if (!tool.verifiedCapabilities.length) errors.push('At least one verified capability is required.')
  if (!tool.supportedTasks.length) errors.push('At least one supported task is required.')
  if (!tool.prohibitedData.some((item) => item.includes('Export-controlled')) || !tool.prohibitedData.some((item) => item.includes('CUI'))) errors.push('The export-control and CUI prohibitions are required.')
  if (tool.dataRiskApproval.includes('controlled' as never)) errors.push('Controlled data cannot be approved for an AI tool.')
  if (tool.studentAvailability === 'all-vt-students' && tool.status !== 'active-service') errors.push('General student availability requires active-service status.')
  if (tool.studentAvailability === 'arc-account-required' && !tool.conditionalRequirements.some((item) => item.toLowerCase().includes('arc account'))) errors.push('ARC-account access must be an explicit condition.')

  tool.officialSources.forEach((source) => {
    if (!ISO_DATE.test(source.lastChecked)) errors.push(`Invalid source check date for ${source.id}.`)
    try {
      if (!evidenceHosts.has(new URL(source.url).hostname)) errors.push(`Unapproved evidence domain for ${source.id}.`)
    } catch {
      errors.push(`Invalid source URL for ${source.id}.`)
    }
  })

  return { valid: errors.length === 0, errors }
}
