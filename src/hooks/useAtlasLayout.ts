import { useEffect, useState, type RefObject } from 'react'
import type { Frame } from '@/domain/atlas/geometry'

export type AtlasLayout = { width: number; height: number; frame: Frame }
const empty: AtlasLayout = {
  width: 0,
  height: 0,
  frame: { x: 0, y: 0, width: 1, height: 1 },
}

/** Measure actual overlays, including safe-area padding and the dynamic bottom sheet. */
export function useAtlasLayout(
  rootRef: RefObject<HTMLElement | null>,
  detailsOpen: boolean,
) {
  const [layout, setLayout] = useState<AtlasLayout>(empty)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const measure = () => {
      const rootBox = root.getBoundingClientRect()
      const width = rootBox.width,
        height = rootBox.height
      const box = (name: string) =>
        root
          .querySelector<HTMLElement>(`.atlas-shell__${name}`)
          ?.getBoundingClientRect()
      const search = box('search'),
        details = detailsOpen ? box('details') : undefined
      const navigation = box('navigation')
      const left = Math.max(16, window.visualViewport?.offsetLeft ?? 0)
      const top = Math.max(24, (search?.bottom ?? 100) - rootBox.top + 16)
      let bottom = height - 40,
        right = width - 16
      if (details) {
        if (details.width >= width * 0.7)
          bottom = Math.min(bottom, details.top - rootBox.top - 16)
        else right = Math.min(right, details.left - rootBox.left - 20)
      }
      if (
        navigation &&
        navigation.top - rootBox.top < bottom &&
        navigation.bottom - rootBox.top > top
      )
        right = Math.min(right, navigation.left - rootBox.left - 12)
      const next = {
        width,
        height,
        frame: {
          x: left,
          y: top,
          width: Math.max(60, right - left),
          height: Math.max(60, bottom - top),
        },
      }
      setLayout((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      )
    }
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    for (const name of ['search', 'details', 'navigation']) {
      const element = root.querySelector(`.atlas-shell__${name}`)
      if (element) observer.observe(element)
    }
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [rootRef, detailsOpen])
  return layout
}
