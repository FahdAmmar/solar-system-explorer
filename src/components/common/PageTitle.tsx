const APP_NAME = 'Solar System Explorer'

// Gives each route its own document title (WCAG 2.4.2). React moves <title> into <head>.
export function PageTitle({ title }: { title?: string }) {
  return <title>{title ? `${title} · ${APP_NAME}` : APP_NAME}</title>
}
