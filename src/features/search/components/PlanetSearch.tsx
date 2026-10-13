import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { buttonClass } from '@/components/ui/buttonClass'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'
import { CloseIcon, SearchIcon } from '@/components/ui/icons'
import { PlanetSwatch } from '@/features/planets/components/PlanetSwatch'
import { PLANET_TYPE_LABELS } from '@/features/planets/utils/formatPlanet'
import { useSolarSystemStore } from '@/store/solarSystemStore'
import type { Planet } from '@/types/planet'
import { searchPlanets } from '../utils/searchPlanets'

const MAX_QUERY_LENGTH = 40
const NO_ACTIVE_OPTION = -1

const getOptionId = (listboxId: string, planet: Planet) => `${listboxId}-${planet.id}`

// Editable combobox with a list popup (WAI-ARIA authoring practices). Choosing a result
// selects the planet, which focuses the camera and opens the information panel.
export function PlanetSearch({ planets }: { planets: readonly Planet[] }) {
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(NO_ACTIVE_OPTION)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(() => searchPlanets(planets, query), [planets, query])

  const hasResults = results.length > 0
  const isListShown = isOpen && hasResults
  const activePlanet = activeIndex >= 0 ? results[activeIndex] : undefined

  // Tapping or clicking anywhere outside closes the popup (blur alone is unreliable on touch).
  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (!activePlanet) return
    document
      .getElementById(getOptionId(listboxId, activePlanet))
      ?.scrollIntoView({ block: 'nearest' })
  }, [activePlanet, listboxId])

  const choose = (planet: Planet) => {
    selectPlanet(planet.id)
    setQuery('')
    setIsOpen(false)
    setActiveIndex(NO_ACTIVE_OPTION)
    // Closes the on-screen keyboard on phones, so the scene is visible again.
    inputRef.current?.blur()
  }

  const moveActive = (step: 1 | -1) => {
    if (!hasResults) return
    setIsOpen(true)
    setActiveIndex((index) => (index + step + results.length) % results.length)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveActive(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveActive(-1)
        break
      case 'Enter': {
        // Typing "mar" then Enter picks the best match. With an empty box Enter does nothing,
        // so the Sun is never chosen by accident.
        const target = activePlanet ?? (query.trim() ? results[0] : undefined)
        if (isOpen && target) {
          event.preventDefault()
          choose(target)
        }
        break
      }
      case 'Escape':
        // preventDefault tells the global Escape handler this press was already used here.
        if (isOpen) {
          event.preventDefault()
          setIsOpen(false)
          setActiveIndex(NO_ACTIVE_OPTION)
        } else if (query) {
          event.preventDefault()
          setQuery('')
        }
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex min-h-11 items-center gap-2 rounded-full glass-panel bg-space/95! pr-1 pl-4 focus-within:border-accent focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Search planets"
          aria-expanded={isListShown}
          aria-controls={isListShown ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            isListShown && activePlanet ? getOptionId(listboxId, activePlanet) : undefined
          }
          value={query}
          maxLength={MAX_QUERY_LENGTH}
          placeholder="Search planets…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
            setActiveIndex(NO_ACTIVE_OPTION)
          }}
          onKeyDown={handleKeyDown}
          // 16px: smaller text makes iOS Safari zoom the page when the field gets focus.
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink-muted"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              setActiveIndex(NO_ACTIVE_OPTION)
              inputRef.current?.focus()
            }}
            className={`${buttonClass('ghost')} size-10 min-h-10 px-0`}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* One polite announcement of how many matches there are. */}
      <p role="status" className="sr-only">
        {isOpen
          ? hasResults
            ? `${results.length} ${results.length === 1 ? 'result' : 'results'}`
            : 'No results'
          : ''}
      </p>

      {isOpen && (
        <SearchPopup>
          {hasResults ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Planets"
              // A scrolling list becomes a Tab stop by itself in Chrome; focus stays in the field.
              tabIndex={-1}
              className="max-h-[min(22rem,50dvh)] overflow-y-auto py-1"
            >
              {results.map((planet, index) => (
                <li
                  key={planet.id}
                  id={getOptionId(listboxId, planet)}
                  role="option"
                  aria-selected={index === activeIndex}
                  // mousedown would blur the input before click lands; keeping focus avoids that.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(planet)}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 px-4 text-sm ${
                    index === activeIndex ? 'bg-accent-soft' : 'hover:bg-white/10'
                  }`}
                >
                  <PlanetSwatch color={planet.color} className="size-5" />
                  <span className="flex-1 font-medium">{planet.name}</span>
                  <span className="text-xs text-ink-muted">
                    {PLANET_TYPE_LABELS[planet.type]}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm break-words text-ink-muted">
              No planets match “{query.trim()}”. Try Earth, Mars or Jupiter.
            </p>
          )}
        </SearchPopup>
      )}
    </div>
  )
}

function SearchPopup({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEntranceAnimation(ref, -8)
  return (
    <div
      ref={ref}
      className="absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-2xl glass-panel"
    >
      {children}
    </div>
  )
}
