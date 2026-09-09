import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function HistoryControls() {
  const location = useLocation()
  const navigate = useNavigate()
  return <><output aria-label="Current route">{location.pathname}</output><button onClick={() => navigate(-1)}>Back</button></>
}

describe('two-page navigation', () => {
  beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => {}))

  it.each(['/', '/responsible-use', '/safety', '/methodology'])('replaces %s with the recommender and preserves back navigation', async (path) => {
    render(<MemoryRouter initialEntries={['/tools', path]} initialIndex={1}><App /><HistoryControls /></MemoryRouter>)
    expect(await screen.findByRole('heading', { level: 1, name: 'Find a VT-supported AI tool for your task' })).toBeInTheDocument()
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/recommend')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Virginia Tech AI tools for students' })).toBeInTheDocument()
  })

  it('offers only the two pages in the menu and closes it after navigation', () => {
    render(<MemoryRouter initialEntries={['/recommend']}><App /></MemoryRouter>)
    const nav = screen.getByRole('navigation', { name: 'Primary navigation' })
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(['Task Recommender', 'VT AI Tools'])
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(within(nav).getByRole('link', { name: 'VT AI Tools' }))
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).getByRole('link', { name: 'VT AI Tools' })).toHaveAttribute('aria-current', 'page')
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
