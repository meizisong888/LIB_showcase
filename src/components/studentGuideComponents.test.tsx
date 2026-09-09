import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RecommendPage } from '../pages/RecommendPage'
import { ToolsPage } from '../pages/ToolsPage'
import { tools } from '../data/tools'

describe('student guide UI', () => {
  it('shows ten distinct task goals and only relevant capability questions', () => {
    render(<MemoryRouter><RecommendPage /></MemoryRouter>)
    expect(screen.getByRole('radio', { name: /Brainstorm ideas or create a first draft/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Build an API-based or automated research workflow/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Understand an image, diagram, screenshot, or voice input/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Generate or edit an image/i })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /Student API access/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Do you already have an ARC account/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /Write, explain, or debug code/i }))
    expect(screen.getByRole('checkbox', { name: /Code writing, explanation, or debugging/i })).toBeDisabled()
    const apiCheckbox = screen.getByRole('checkbox', { name: /Student API access/i })
    fireEvent.click(apiCheckbox)
    expect(screen.getByText(/Do you already have an ARC account/i)).toBeInTheDocument()
  })

  it('stops immediately and returns no tool for controlled data', () => {
    render(<MemoryRouter><RecommendPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('radio', { name: /Export-controlled data or CUI/i }))
    expect(screen.getAllByText('No verified Virginia Tech student AI tool currently matches all of these requirements.').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /Do not use an AI tool for this data/i })).toBeInTheDocument()
    expect(screen.queryByText('Primary recommendation')).not.toBeInTheDocument()
  })

  it('shows all equally suitable top matches instead of choosing by catalog order', () => {
    render(<MemoryRouter><RecommendPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Show verified matches/i }))
    expect(screen.getAllByText('Equally suitable verified matches').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Equally suitable verified match')).toHaveLength(3)
  })

  it('renders exact direct-access buttons for all six verified tools', () => {
    render(<ToolsPage />)
    const expected = [
      ['Open HokieAI', 'https://hokie.ai.vt.edu/'],
      ['Open Gemini with your VT account', 'https://gemini.google.com/'],
      ['Open NotebookLM with your VT account', 'https://notebooklm.google.com/'],
      ['Open Copilot Chat with your VT account', 'https://copilot.microsoft.com/'],
      ['Open ARC LLM Gateway', 'https://llm.arc.vt.edu/'],
      ['Open ARC Open OnDemand', 'https://ood.arc.vt.edu/'],
    ] as const
    expected.forEach(([name, href]) => {
      const link = screen.getByRole('link', { name: new RegExp(name, 'i') })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('renders only verified VT student tool cards and account reminders', () => {
    render(<ToolsPage />)
    expect(screen.getAllByText('Available to all VT students')).toHaveLength(5)
    expect(screen.getByText('Requires ARC account')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'HokieAI' })).toBeInTheDocument()
    expect(screen.getAllByText(/personal Google account does not inherit VT protections/i)).toHaveLength(2)
  })

  it('keeps all official sources and verification dates on their tool cards', () => {
    render(<ToolsPage />)
    tools.forEach((tool) => {
      const card = screen.getByRole('heading', { name: tool.name }).closest('article')!
      const sources = within(card).getByRole('list', { name: 'Official sources' })
      expect(within(sources).getAllByRole('link').map((link) => link.getAttribute('href')))
        .toEqual(tool.officialSources.map((source) => source.url))
      expect(card.querySelector('time')).toHaveAttribute('datetime', tool.lastVerified)
    })
  })

  it('keeps task-fit and capability evidence on the primary result', () => {
    render(<MemoryRouter initialEntries={['/recommend?goal=questions-provided-sources&sensitivity=internal']}><RecommendPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Show verified matches/i }))
    const card = screen.getByText('Primary recommendation').closest('article')!
    expect(within(card).getByRole('heading', { name: 'Google NotebookLM through Virginia Tech' })).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: /Open NotebookLM with your VT account/ })).toHaveAttribute('href', 'https://notebooklm.google.com/')
    expect(within(card).getByRole('list', { name: 'Official sources' })).not.toBeEmptyDOMElement()
    expect(within(card).getByRole('region', { name: /Mandatory features satisfied/ })).toHaveTextContent('File upload')
    expect(card.querySelector('time')).toHaveAttribute('datetime', '2026-09-06')
  })
})
