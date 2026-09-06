import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { WorkflowMap } from './WorkflowMap'
import { RecommendPage } from '../pages/RecommendPage'
import { ToolsPage } from '../pages/ToolsPage'

describe('student guide UI', () => {
  it('renders the five-stage access-first recommendation flow', () => {
    render(<WorkflowMap />)
    const figure = screen.getByRole('figure', { name: /eligibility comes before fit/i })
    expect(within(figure).getAllByRole('listitem')).toHaveLength(5)
    expect(within(figure).getByText('Student access')).toBeInTheDocument()
  })

  it('shows the six requested input areas and blocks controlled data', () => {
    render(<MemoryRouter><RecommendPage /></MemoryRouter>)
    expect(screen.getByRole('radio', { name: /Brainstorming \/ general writing/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /based on material you provide/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /upload a file/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /programming or API access/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /Export-controlled data or CUI/i }))
    fireEvent.click(screen.getByRole('button', { name: /Show verified matches/i }))
    expect(screen.getAllByText('No verified Virginia Tech student AI tool currently matches all of these requirements.').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /Do not use an AI tool for this data/i })).toBeInTheDocument()
  })

  it('renders only verified VT student tool cards and access badges', () => {
    render(<ToolsPage />)
    expect(screen.getAllByText('Available to all VT students')).toHaveLength(5)
    expect(screen.getByText('Requires ARC account')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'HokieAI' })).toBeInTheDocument()
  })
})
