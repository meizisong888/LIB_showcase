import { useEffect } from 'react'
import { VT_TOOLS_URL } from '../config'

export function ToolsPage() {
  useEffect(() => {
    window.location.replace(VT_TOOLS_URL)
  }, [])

  return <section className="container tools-redirect"><h1>Opening VT AI Tools</h1><a href={VT_TOOLS_URL}>Continue to the official Virginia Tech AI tools page</a></section>
}
