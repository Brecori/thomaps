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
    const map = root.querySelector<HTMLElement>('.atlas-shell__map')
    const measure = () => {
      const rootBox = root.getBoundingClientRect()
      const mapBox = map?.getBoundingClientRect() ?? rootBox
      const width = mapBox.width,
        height = mapBox.height
      const box = (name: string) => {
        const measured = root
          .querySelector<HTMLElement>(`.atlas-shell__${name}`)
          ?.getBoundingClientRect()
        return measured?.width && measured.height ? measured : undefined
      }
      const actions = box('actions'),
        search = actions ? undefined : box('search'),
        details = detailsOpen ? box('details') : undefined
      root.style.setProperty('--details-height', `${details?.height ?? 0}px`)
      const navigation = box('navigation'),
        brand = box('brand')
      const left = Math.max(16, window.visualViewport?.offsetLeft ?? 0)
      const top = Math.max(
        24,
        (search?.bottom ?? brand?.bottom ?? rootBox.top) - rootBox.top + 16,
      )
      let bottom = Math.min(height, rootBox.height) - 40,
        right = Math.min(width, rootBox.width) - 16
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
    if (map) observer.observe(map)
    for (const name of [
      'search',
      'details',
      'navigation',
      'brand',
      'actions',
    ]) {
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
