import type { SVGProps } from 'react'

// Small inline icons. They inherit the text color and are hidden from screen readers:
// every button that uses one also has a text label.
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  )
}

export const PlayIcon = () => (
  <Icon fill="currentColor" stroke="none">
    <path d="M4 2.2v11.6L13.5 8z" />
  </Icon>
)

export const PauseIcon = () => (
  <Icon fill="currentColor" stroke="none">
    <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" />
  </Icon>
)

export const CheckIcon = () => (
  <Icon>
    <path d="M3 8.5l3.2 3.2L13 4.8" />
  </Icon>
)

export const CircleIcon = () => (
  <Icon>
    <circle cx="8" cy="8" r="4.6" />
  </Icon>
)

export const ResetIcon = () => (
  <Icon>
    <path d="M2.5 8a5.5 5.5 0 1 0 1.8-4.1M2.5 2.5v3h3" />
  </Icon>
)

export const CloseIcon = () => (
  <Icon>
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </Icon>
)

export const SearchIcon = () => (
  <Icon>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L14 14" />
  </Icon>
)

export const ChevronIcon = ({ up = false }: { up?: boolean }) => (
  <Icon>
    <path d={up ? 'M3.5 10l4.5-4.5 4.5 4.5' : 'M3.5 6l4.5 4.5L12.5 6'} />
  </Icon>
)

export const SwapIcon = () => (
  <Icon>
    <path d="M2.5 5h10.5M10.5 2.5L13 5l-2.5 2.5M13.5 11H3M5.5 8.5L3 11l2.5 2.5" />
  </Icon>
)

export const ArrowRightIcon = () => (
  <Icon>
    <path d="M2.5 8h11M9 3.5L13.5 8 9 12.5" />
  </Icon>
)
