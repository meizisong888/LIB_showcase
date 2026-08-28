import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { skills } from '../data/skills'
import type { SkillFilters } from '../lib/filters'
import { AdvancedFilters } from './AdvancedFilters'
import { DataDecisionTree } from './DataDecisionTree'
import { ScenarioExplorer } from './ScenarioExplorer'
import { SkillEvaluationChecklist } from './SkillEvaluationChecklist'
import { SkillExampleArtifact } from './SkillExampleArtifact'
import { TaskToolMatrix } from './TaskToolMatrix'
import { WorkflowMap } from './WorkflowMap'

const filters: SkillFilters = { search: '', category: '', role: '', tool: '', type: '', inputType: '', risk: '', web: '', auth: '', code: '' }

describe('round-two interactive components', () => {
  it('renders the five-step accessible workflow map', () => {
    render(<WorkflowMap />)
    expect(screen.getByRole('figure', { name: /product is one step/i })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })

  it('renders a complete 8 × 8 task-tool matrix with a non-ranking note', () => {
    render(<TaskToolMatrix />)
    const table = screen.getByRole('table', { name: /documented capability fit/i })
    expect(within(table).getAllByRole('row')).toHaveLength(9)
    expect(screen.getByText(/not an empirical quality ranking/i)).toBeInTheDocument()
  })

  it('switches role scenarios and creates a fully prefilled finder link', () => {
    render(<MemoryRouter><ScenarioExplorer /></MemoryRouter>)
    fireEvent.click(screen.getByRole('tab', { name: 'Staff' }))
    expect(screen.getByRole('heading', { name: /approved notes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /prefilled scenario/i })).toHaveAttribute('href', expect.stringContaining('role=staff'))
  })

  it('shows a structured educational example with failure and revision', () => {
    const example = skills.find((skill) => skill.slug === 'code-change-loop')!.example!
    render(<SkillExampleArtifact example={example} />)
    expect(screen.getByRole('heading', { name: 'Worked example' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Likely failure' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Human revision' })).toBeInTheDocument()
  })

  it('updates the local installable-skill permission summary', () => {
    render(<SkillEvaluationChecklist />)
    expect(screen.getByRole('heading', { name: /6 permission checks remain/i })).toBeInTheDocument()
    screen.getAllByRole('checkbox').forEach((box) => fireEvent.click(box))
    expect(screen.getByRole('heading', { name: /checklist complete/i })).toBeInTheDocument()
  })

  it('keeps advanced inputs grouped and exposes the data decision tree', () => {
    const update = vi.fn()
    const { rerender } = render(<AdvancedFilters filters={filters} update={update} />)
    fireEvent.click(screen.getByText('Advanced filters'))
    fireEvent.change(screen.getByLabelText('Code execution'), { target: { value: 'true' } })
    expect(update).toHaveBeenCalledWith('code', 'true')
    rerender(<MemoryRouter><DataDecisionTree /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /Can this data enter/i })).toBeInTheDocument()
    expect(screen.getByText(/minimum necessary data/i)).toBeInTheDocument()
  })
})
