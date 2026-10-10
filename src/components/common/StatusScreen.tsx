import type { ReactNode } from 'react'

interface StatusScreenProps {
  variant: 'loading' | 'error' | 'empty'
  title: string
  message?: string
  /** Recovery actions, such as a retry button. */
  children?: ReactNode
}

// One centered layout for every "not the normal view" state of a page.
// Errors use role="alert" (announced at once); the others use role="status" (announced politely).
export function StatusScreen({ variant, title, message, children }: StatusScreenProps) {
  return (
    <section
      role={variant === 'error' ? 'alert' : 'status'}
      className="grid h-full place-items-center p-6 text-center"
    >
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {message && <p className="mt-3 text-sm text-ink-muted">{message}</p>}
        {variant === 'loading' && (
          <div
            aria-hidden="true"
            className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-edge"
          >
            <div className="h-full w-2/5 animate-[sweep_1.4s_ease-in-out_infinite] rounded-full bg-accent motion-reduce:w-full motion-reduce:animate-none" />
          </div>
        )}
        {children && <div className="mt-6 flex justify-center gap-3">{children}</div>}
      </div>
    </section>
  )
}
