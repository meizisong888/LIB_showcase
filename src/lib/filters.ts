import type { Skill, Tool } from '../types'

export interface ToolFilters {
  search: string
  family: string
  capability: string
}

export interface SkillFilters {
  search: string
  category: string
  role: string
  tool: string
  type: string
  inputType: string
  risk: string
  web: string
  auth: string
  code: string
}

const includesQuery = (values: string[], query: string) => values.join(' ').toLowerCase().includes(query.trim().toLowerCase())

export function filterTools(tools: Tool[], filters: ToolFilters): Tool[] {
  return tools.filter((tool) => {
    const searchable = [tool.name, tool.provider, tool.family, tool.summary, ...tool.bestFor, ...tool.strengths]
    const capabilityMatch = !filters.capability
      || (filters.capability === 'web' && tool.webAccess)
      || (filters.capability === 'citations' && tool.citations !== 'limited')
      || (filters.capability === 'files' && tool.fileEditing)
      || (filters.capability === 'coding' && tool.coding !== 'limited')
      || (filters.capability === 'collaboration' && tool.collaborationModes.length > 0)
    return includesQuery(searchable, filters.search)
      && (!filters.family || tool.family === filters.family)
      && capabilityMatch
  })
}

export function toggleComparison(current: string[], id: string, limit = 3): string[] {
  if (current.includes(id)) return current.filter((item) => item !== id)
  if (current.length >= limit) return current
  return [...current, id]
}

export function filterSkills(skills: Skill[], filters: SkillFilters): Skill[] {
  return skills.filter((skill) => {
    return includesQuery([skill.name, skill.summary, skill.problem, skill.category], filters.search)
      && (!filters.category || skill.category === filters.category)
      && (!filters.role || skill.roles.includes(filters.role))
      && (!filters.tool || skill.compatibleTools.includes(filters.tool))
      && (!filters.type || skill.type === filters.type)
      && (!filters.inputType || skill.inputTypes.includes(filters.inputType))
      && (!filters.risk || skill.risk === filters.risk)
      && (!filters.web || String(skill.requiresWeb) === filters.web)
      && (!filters.auth || String(skill.requiresAuth) === filters.auth)
      && (!filters.code || String(skill.executesCode) === filters.code)
  })
}
