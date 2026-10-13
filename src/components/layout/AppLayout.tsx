import { type MouseEvent, useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { MAIN_CONTENT_ID } from './mainContent'

const NAV_ITEMS = [
  { to: '/explore', label: 'Explore' },
  { to: '/compare', label: 'Compare' },
  { to: '/about', label: 'About' },
] as const

const focusRing =
  'rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

// A planet on its orbit.
function BrandMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.5"
        transform="rotate(-24 12 12)"
        stroke="var(--color-accent)"
        strokeWidth="1.4"
        opacity="0.7"
      />
      <circle cx="12" cy="12" r="4.2" fill="var(--color-accent)" />
    </svg>
  )
}

export function AppLayout() {
  const mainRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  // A new page is not announced or reached by keyboard on its own: the nav link keeps focus and
  // the scroll position carries over. After a navigation, start the new page from its top.
  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    mainRef.current?.focus({ preventScroll: true })
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  // A plain #hash link would put a fragment in the URL, so focus is moved directly.
  const skipToContent = (event: MouseEvent) => {
    event.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <div className="flex h-full flex-col">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-space focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      >
        Skip to main content
      </a>
      <header className="flex items-center justify-between gap-2 border-b border-edge bg-space px-3 sm:gap-3 sm:px-5">
        <NavLink
          to="/"
          className={`flex min-h-11 items-center gap-1.5 text-sm font-semibold tracking-wide sm:gap-2 sm:pr-2 ${focusRing}`}
        >
          <BrandMark />
          <span>
            {/* Words drop out visually on narrow screens so the header stays on one line; the link name stays complete. */}
            <span className="sr-only sm:not-sr-only">Solar System </span>
            <span className="sr-only min-[22rem]:not-sr-only">Explorer</span>
          </span>
        </NavLink>
        <nav aria-label="Main">
          <ul className="flex items-center">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center px-2 text-sm sm:px-3.5 ${focusRing} ${
                      isActive
                        ? 'text-accent underline underline-offset-8'
                        : 'text-ink-muted hover:text-ink'
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
      {/* tabIndex -1: focusable by script (skip link, navigation) but not a Tab stop. */}
      <main
        ref={mainRef}
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="min-h-0 flex-1 overflow-y-auto focus:outline-none"
      >
        <Outlet />
      </main>
    </div>
  )
}
