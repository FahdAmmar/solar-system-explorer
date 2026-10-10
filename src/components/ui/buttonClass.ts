export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const BASE =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-space hover:bg-white',
  secondary: 'border border-edge-strong bg-panel text-ink hover:border-accent',
  ghost: 'text-ink-muted hover:bg-white/10 hover:text-ink',
}

// One look for <button> and <Link>, so actions match wherever they appear.
export const buttonClass = (variant: ButtonVariant = 'secondary') =>
  `${BASE} ${VARIANTS[variant]}`
