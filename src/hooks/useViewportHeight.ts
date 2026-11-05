import { useEffect } from 'react'

/** Keep overlays in the visible viewport while the map retains its full height. */
export function useViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport
    const root = document.documentElement
    const sync = () => {
      const height = viewport?.height ?? window.innerHeight
      root.style.setProperty('--visible-height', `${height}px`)
      root.toggleAttribute(
        'data-compact-viewport',
        window.matchMedia('(max-height: 559px)').matches,
      )
    }
    sync()
    viewport?.addEventListener('resize', sync)
    window.addEventListener('resize', sync)
    return () => {
      viewport?.removeEventListener('resize', sync)
      window.removeEventListener('resize', sync)
      root.style.removeProperty('--visible-height')
      root.removeAttribute('data-compact-viewport')
    }
  }, [])
}
