import { CheckIcon, CircleIcon } from '@/components/ui/icons'

interface ToggleChipProps {
  label: string
  pressed: boolean
  onToggle: () => void
}

// The state is shown by an icon and a filled background, never by color alone.
export function ToggleChip({ label, pressed, onToggle }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={`inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none ${
        pressed
          ? 'border-accent bg-accent-soft text-ink'
          : 'border-edge text-ink-muted hover:border-edge-strong hover:text-ink'
      }`}
    >
      {pressed ? <CheckIcon /> : <CircleIcon />}
      {label}
    </button>
  )
}
