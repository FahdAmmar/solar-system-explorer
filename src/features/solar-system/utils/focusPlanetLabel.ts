import { MAIN_CONTENT_ID } from '@/components/layout/mainContent'

export const PLANET_LABEL_ATTRIBUTE = 'data-planet-label'

// Label buttons are the keyboard route to a planet, so focus goes back to them. An off-screen
// label is out of the tab order (see overlayFrame), so focus goes to the main region instead
// of being dropped on <body>.
export function focusPlanetLabel(id: string) {
  const label = document.querySelector<HTMLElement>(
    `[${PLANET_LABEL_ATTRIBUTE}="${CSS.escape(id)}"]`,
  )
  const target =
    label && label.tabIndex >= 0 ? label : document.getElementById(MAIN_CONTENT_ID)
  target?.focus({ preventScroll: true })
}
