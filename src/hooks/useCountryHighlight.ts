import type { RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/** Animate the overlay stroke only: territory geometry and hit areas stay fixed. */
export function useCountryHighlight(
  scope: RefObject<SVGSVGElement | null>,
  selectedId: string | null,
) {
  useGSAP(
    () => {
      const elements = scope.current?.querySelectorAll(
        '.country-outline--selected, .country-marker.is-selected',
      )
      if (!selectedId || !elements?.length) return
      let firstRun = true
      const media = gsap.matchMedia()
      media.add(
        { all: 'all', reduced: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const animate = firstRun && !context.conditions?.reduced
          firstRun = false
          if (animate)
            gsap.fromTo(
              elements,
              { opacity: 0.45, strokeWidth: 4.5 },
              {
                opacity: 1,
                strokeWidth: 3,
                duration: 0.28,
                ease: 'power2.out',
                clearProps: 'opacity,strokeWidth',
              },
            )
          else gsap.set(elements, { clearProps: 'opacity,strokeWidth' })
        },
      )
      return () => media.revert()
    },
    { scope, dependencies: [selectedId], revertOnUpdate: true },
  )
}
