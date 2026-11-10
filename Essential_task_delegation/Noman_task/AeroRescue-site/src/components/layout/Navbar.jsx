import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE, NAV_LINKS } from '../../config/site'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-accent/15 text-accent' : 'text-muted hover:text-white'}`

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-semibold">{SITE.name}</Link>
        <nav className="hidden gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>{l.label}</NavLink>
          ))}
        </nav>
        <Link to="/demo" className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg md:block">
          Try the demo
        </Link>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}