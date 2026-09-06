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
    ['accessCta', tool.accessCta], ['costOrLimits', tool.costOrLimits], ['lastVerified', tool.lastVerified],
  ]
  requiredStrings.forEach(([field, value]) => { if (!value) errors.push(`Missing ${field}.`) })
  if (!ISO_DATE.test(tool.lastVerified)) errors.push('Missing or invalid lastVerified date.')
  if (!tool.officialSources.length) errors.push('At least one official source is required.')
  if (!tool.verifiedCapabilities.length) errors.push('At least one verified capability is required.')
  if (!tool.supportedTasks.length) errors.push('At least one supported task is required.')
  if (!tool.prohibitedData.some((item) => item.includes('Export-controlled')) || !tool.prohibitedData.some((item) => item.includes('CUI'))) errors.push('The export-control and CUI prohibitions are required.')
  if (tool.dataRiskApproval.includes('controlled' as never)) errors.push('Controlled data cannot be approved for an AI tool.')

  const recommendable = tool.studentAvailability === 'all-vt-students' || tool.studentAvailability === 'arc-account-required'
  if (!recommendable) errors.push('Employee-only, limited-pilot, and unverified tools cannot enter the student recommendation catalog.')
  if (tool.studentAvailability === 'all-vt-students' && tool.status !== 'active-service') errors.push('General student availability requires active-service status.')
  if (tool.studentAvailability === 'arc-account-required' && tool.status !== 'conditional-access') errors.push('ARC-account availability requires conditional-access status.')
  if (tool.studentAvailability === 'arc-account-required') {
    const conditions = tool.conditionalRequirements.join(' ').toLowerCase()
    if (!conditions.includes('arc account')) errors.push('ARC-account access must be an explicit condition.')
    if (!conditions.includes('allocation')) errors.push('An ARC allocation must be an explicit condition.')
    if (!conditions.includes('network') && !conditions.includes('vpn')) errors.push('VT network or VPN access must be an explicit condition.')
  }

  const sourceIds = new Set<string>()
  tool.officialSources.forEach((source) => {
    if (sourceIds.has(source.id)) errors.push(`Duplicate official source id ${source.id}.`)
    sourceIds.add(source.id)
    if (!ISO_DATE.test(source.lastChecked)) errors.push(`Invalid source check date for ${source.id}.`)
    try {
      if (!evidenceHosts.has(new URL(source.url).hostname)) errors.push(`Unapproved evidence domain for ${source.id}.`)
    } catch {
      errors.push(`Invalid source URL for ${source.id}.`)
    }
  })

  const capabilityNames = new Set<string>()
  tool.verifiedCapabilities.forEach((record) => {
    if (capabilityNames.has(record.capability)) errors.push(`Duplicate capability ${record.capability}.`)
    capabilityNames.add(record.capability)
    if (!record.sourceIds.length) errors.push(`Capability ${record.capability} requires a specific official source.`)
    if (!record.evidenceSummary.trim()) errors.push(`Capability ${record.capability} requires an evidence summary.`)
    record.sourceIds.forEach((id) => {
      if (!sourceIds.has(id)) errors.push(`Capability ${record.capability} references unknown source ${id}.`)
    })
  })

  const taskGoals = new Set<string>()
  tool.supportedTasks.forEach((record) => {
    if (taskGoals.has(record.goal)) errors.push(`Duplicate task fit ${record.goal}.`)
    taskGoals.add(record.goal)
    if (!record.sourceIds.length) errors.push(`Task fit ${record.goal} requires a specific official source.`)
    if (!record.evidenceSummary.trim()) errors.push(`Task fit ${record.goal} requires an evidence summary.`)
    if (!record.reason.trim()) errors.push(`Task fit ${record.goal} requires a reason.`)
    record.sourceIds.forEach((id) => {
      if (!sourceIds.has(id)) errors.push(`Task fit ${record.goal} references unknown source ${id}.`)
    })
  })

  return { valid: errors.length === 0, errors }
}
