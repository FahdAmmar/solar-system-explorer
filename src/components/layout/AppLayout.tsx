import { NavLink, Outlet } from 'react-router'

const NAV_ITEMS = [
  { to: '/explore', label: 'Explore' },
  { to: '/compare', label: 'Compare' },
  { to: '/about', label: 'About' },
] as const

const focusRing =
  'rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300'

export function AppLayout() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-white/10 px-4 py-2">
        <NavLink to="/" className={`text-sm font-semibold tracking-wide ${focusRing}`}>
          Solar System Explorer
        </NavLink>
        <nav aria-label="Main">
          <ul className="flex gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-sm ${focusRing} ${
                      isActive
                        ? 'text-sky-300 underline underline-offset-4'
                        : 'text-slate-300 hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
