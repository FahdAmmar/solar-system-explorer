import { useSolarSystemStore } from '@/store/solarSystemStore'

// Returns to the overview and clears the selection. The controls panel (Phase 7) takes this over.
export function ResetViewButton() {
  const resetView = useSolarSystemStore((state) => state.resetView)

  return (
    <button
      type="button"
      onClick={resetView}
      className="absolute right-3 bottom-3 min-h-11 cursor-pointer rounded-full border border-white/20 bg-slate-950/70 px-4 text-sm text-slate-100 transition-colors hover:border-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 motion-reduce:transition-none"
    >
      Reset view
    </button>
  )
}
