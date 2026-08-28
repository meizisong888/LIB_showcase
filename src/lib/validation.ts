import { sourceById } from '../data/sources'
import type { Skill, Tool, VerificationStatus } from '../types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

function validateCommon(record: Tool | Skill): string[] {
  const errors: string[] = []
  if (!record.id || !record.slug || !record.name) errors.push('Missing id, slug, or name.')
  if (!ISO_DATE.test(record.verifiedAt)) errors.push('Missing or invalid verification date.')
  if (record.sourceIds.length === 0) errors.push('At least one source is required.')
  const missingSources = record.sourceIds.filter((id) => !sourceById[id])
  if (missingSources.length) errors.push(`Unknown sources: ${missingSources.join(', ')}.`)
  return errors
}

export function validateTool(tool: Tool): ValidationResult {
  const errors = validateCommon(tool)
  if (!tool.bestFor.length || !tool.limitations.length) errors.push('Tool boundaries are required.')
  return { valid: errors.length === 0, errors }
}

export function validateSkill(skill: Skill): ValidationResult {
  const errors = validateCommon(skill)
  if (!skill.useWhen.length || !skill.avoidWhen.length || !skill.checklist.length) errors.push('Skill usage boundaries and checklist are required.')
  if (skill.type === 'installable') {
    const details = skill.installable
    if (!details) errors.push('Installable metadata is required.')
    else if (!details.publisher || !details.repositoryUrl || !details.license || !details.platforms.length || !details.permissions.length || !details.maintenanceStatus || !details.securityNotes) {
      errors.push('Installable publisher, source, license, platform, permission, maintenance, and security metadata are required.')
    }
  }
  return { valid: errors.length === 0, errors }
}

export function displayStatus(status: VerificationStatus, result: ValidationResult): VerificationStatus {
  return status === 'verified' && !result.valid ? 'needs-review' : status
}
