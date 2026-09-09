import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function HistoryControls() {
  const location = useLocation()
  const navigate = useNavigate()
  return <><output aria-label="Current route">{location.pathname}</output><button onClick={() => navigate(-1)}>Back</button></>
}

describe('recommender and official tools navigation', () => {
  beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => {}))

  it.each(['/', '/responsible-use', '/safety', '/methodology'])('replaces %s with the recommender and preserves back navigation', async (path) => {
    render(<MemoryRouter initialEntries={['/previous-page', path]} initialIndex={1}><App /><HistoryControls /></MemoryRouter>)
    expect(await screen.findByRole('heading', { level: 1, name: 'Find a VT-supported AI tool for your task' })).toBeInTheDocument()
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/recommend')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'This page could not be found.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/previous-page')
  })

  it('links directly to official VT tools and closes the menu after internal navigation', () => {
    render(<MemoryRouter initialEntries={['/recommend']}><App /></MemoryRouter>)
    const nav = screen.getByRole('navigation', { name: 'Primary navigation' })
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(['Task Recommender', 'VT AI Tools'])
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    screen.getAllByRole('link', { name: 'VT AI Tools' }).forEach((link) => {
      expect(link).toHaveAttribute('href', 'https://ai.vt.edu/tools.html')
      expect(link).not.toHaveAttribute('target')
    })
    expect(screen.getByRole('link', { name: /View official VT tools/ })).toHaveAttribute('href', 'https://ai.vt.edu/tools.html')
    fireEvent.click(within(nav).getByRole('link', { name: 'Task Recommender' }))
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).getByRole('link', { name: 'Task Recommender' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText(/Responsible Use/i)).not.toBeInTheDocument()
    expect(document.querySelector('a[href*="responsible-use"]')).toBeNull()
  })

  it('skips to the main content without changing the hash route', () => {
    render(<MemoryRouter initialEntries={['/recommend']}><App /><HistoryControls /></MemoryRouter>)
    const link = screen.getByRole('link', { name: 'Skip to main content' })
    expect(fireEvent.click(link)).toBe(false)
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/recommend')
  })
})
