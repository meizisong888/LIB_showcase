import type { Skill, Tool } from '../types'

export interface ToolFilters {
  search: string
  category: string
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
  permission: string
}

const includesQuery = (values: string[], query: string) => values.join(' ').toLowerCase().includes(query.trim().toLowerCase())

export function filterTools(tools: Tool[], filters: ToolFilters): Tool[] {
  return tools.filter((tool) => {
    const searchable = [tool.name, tool.provider, tool.category, tool.summary, ...tool.bestFor, ...tool.strengths]
    const capabilityMatch = !filters.capability
      || (filters.capability === 'web' && tool.webAccess)
      || (filters.capability === 'citations' && tool.citations !== 'limited')
      || (filters.capability === 'files' && tool.fileEditing)
      || (filters.capability === 'coding' && tool.coding !== 'limited')
      || (filters.capability === 'collaboration' && tool.collaboration)
    return includesQuery(searchable, filters.search)
      && (!filters.category || tool.category === filters.category)
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
    const permissionMatch = !filters.permission
      || (filters.permission === 'auth' && skill.requiresAuth)
      || (filters.permission === 'code' && skill.executesCode)
    return includesQuery([skill.name, skill.summary, skill.problem, skill.category], filters.search)
      && (!filters.category || skill.category === filters.category)
      && (!filters.role || skill.roles.includes(filters.role))
      && (!filters.tool || skill.compatibleTools.includes(filters.tool))
      && (!filters.type || skill.type === filters.type)
      && (!filters.inputType || skill.inputTypes.includes(filters.inputType))
      && (!filters.risk || skill.risk === filters.risk)
      && (!filters.web || String(skill.requiresWeb) === filters.web)
      && permissionMatch
  })
}
