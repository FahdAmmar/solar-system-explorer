import { Component, type ReactNode } from 'react'

interface SilentErrorBoundaryProps {
  children: ReactNode
}

interface SilentErrorBoundaryState {
  failed: boolean
}

// For decoration only. If the content crashes (a chunk fails to download, the WebGL context
// is lost), it disappears and the rest of the page keeps working, instead of the whole
// route being replaced by an error screen.
export class SilentErrorBoundary extends Component<
  SilentErrorBoundaryProps,
  SilentErrorBoundaryState
> {
  state: SilentErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): SilentErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Decorative content failed and was hidden:', error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
