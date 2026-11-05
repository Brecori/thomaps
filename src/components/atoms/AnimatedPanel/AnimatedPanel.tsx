import { useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

type AnimatedPanelProps = HTMLAttributes<HTMLDivElement> & {
  contentKey?: string
}

/** Retains only the visual content during exit; selection stays owned by the page. */
export function AnimatedPanel({
  children,
  contentKey,
  inert,
  ...props
}: AnimatedPanelProps) {
  const present = children != null
  const [snapshot, setSnapshot] = useState<ReactNode>(children)
  // Remember the latest content without replaying motion on audio/status updates.
  if (present && snapshot !== children) setSnapshot(children)
  const content = present ? children : snapshot
  const hasContent = content != null
  const surface = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const element = surface.current
      if (!element) return
      let firstRun = true
      const media = gsap.matchMedia()
      media.add(
        {
          all: 'all',
          sheet: '(max-width: 767px) and (min-height: 551px)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const animate = firstRun && !context.conditions?.reduced
          firstRun = false
          const offset = context.conditions?.sheet
            ? { x: 0, y: 18 }
            : { x: 12, y: 0 }
          if (!animate) {
            if (present) gsap.set(element, { clearProps: 'transform,opacity' })
            else {
              gsap.set(element, { opacity: 0 })
              setSnapshot(undefined)
            }
            return
          }
          if (present) {
            gsap.fromTo(
              element,
              { ...offset, opacity: 0 },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.26,
                ease: 'power2.out',
                clearProps: 'transform,opacity',
              },
            )
          } else {
            gsap.to(element, {
              ...offset,
              opacity: 0,
              duration: 0.14,
              ease: 'power1.in',
              onComplete: () => setSnapshot(undefined),
            })
          }
        },
      )
      return () => media.revert()
    },
    {
      scope: surface,
      dependencies: [present, contentKey, hasContent],
      revertOnUpdate: true,
    },
  )

  return hasContent ? (
    <div
      {...props}
      inert={inert || !present}
      aria-hidden={!present || undefined}
      data-exiting={!present || undefined}
    >
      <div ref={surface} className="animated-panel__surface">
        {content}
      </div>
    </div>
  ) : null
}
