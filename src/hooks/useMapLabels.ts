import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react'
import type { CountryLabel } from '@/domain/atlas/labels'

type MeasuredLabel = {
  element: SVGTextElement
  halfWidthRatio: number
  halfHeightRatio: number
  radius: number
  visible: boolean
}

/** Cache font metrics; zoom only updates SVG attributes, without React state or layout reads. */
export function useMapLabels(
  layerRef: RefObject<SVGGElement | null>,
  labels: CountryLabel[],
) {
  const measured = useRef<MeasuredLabel[]>([])
  const scale = useRef({ k: 1, minimum: 1 })
  const update = useCallback((k: number, minimum: number) => {
    scale.current = { k, minimum }
    const fontSize = Math.min(18, 10 + Math.log2(Math.max(1, k / minimum)) * 3)
    for (const label of measured.current) {
      // Keep the complete text rectangle and a little spacing inside the country.
      const neededRadius =
        Math.hypot(label.halfWidthRatio, label.halfHeightRatio) * fontSize + 1.5
      const visible = neededRadius <= label.radius * k * 0.98
      if (label.visible !== visible) {
        label.element.style.visibility = visible ? 'visible' : 'hidden'
        label.visible = visible
      }
      if (visible) {
        label.element.style.fontSize = `${fontSize / k}px`
      }
    }
  }, [])

  useLayoutEffect(() => {
    let mounted = true
    const measure = () => {
      if (!mounted || !layerRef.current) return
      measured.current = Array.from(
        layerRef.current.querySelectorAll<SVGTextElement>('.country-label'),
      ).map((element) => {
        const box = element.getBBox()
        const fontSize = parseFloat(getComputedStyle(element).fontSize)
        const x = Number(element.getAttribute('x')),
          y = Number(element.getAttribute('y'))
        return {
          element,
          halfWidthRatio:
            Math.max(Math.abs(box.x - x), Math.abs(box.x + box.width - x)) /
            fontSize,
          halfHeightRatio:
            Math.max(Math.abs(box.y - y), Math.abs(box.y + box.height - y)) /
            fontSize,
          radius: Number(element.dataset.radius),
          visible: element.style.visibility === 'visible',
        }
      })
      update(scale.current.k, scale.current.minimum)
    }
    measure()
    void document.fonts.ready.then(measure)
    return () => {
      mounted = false
      measured.current = []
    }
  }, [labels, layerRef, update])

  return update
}
