import { useEffect } from 'react'

/** Keep the shell inside the visible viewport when browser chrome or the keyboard moves. */
export function useViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport
    const root = document.documentElement
    const sync = () => {
      const height = viewport?.height ?? window.innerHeight
      root.style.setProperty('--app-height', `${height}px`)
      root.toggleAttribute('data-compact-viewport', height < 560)
    }
    sync()
    viewport?.addEventListener('resize', sync)
    window.addEventListener('resize', sync)
    return () => {
      viewport?.removeEventListener('resize', sync)
      window.removeEventListener('resize', sync)
      root.style.removeProperty('--app-height')
      root.removeAttribute('data-compact-viewport')
    }
  }, [])
}
