import { useLayoutEffect, useRef, type RefObject } from 'react'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from 'd3-zoom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  constrainView,
  MAX_ZOOM,
  MIN_ZOOM,
  minimumZoom,
  type ViewTransform,
  type Frame,
} from '@/domain/atlas/geometry'

export type NavigationRequest = {
  id: number
  action: 'in' | 'out' | 'world' | 'focus'
}
export type NavigationStatus = { k: number; minZoom: number; moving: boolean }
type NavigationOptions = {
  width: number
  height: number
  frame: Frame
  viewport: Frame
  target: ViewTransform
  worldBounds: [[number, number], [number, number]]
  request: NavigationRequest
  preserveView?: boolean
  onStatus: (status: NavigationStatus) => void
  onZoom: (k: number, minimum: number) => void
}

/** D3 owns the transform. GSAP React owns the lifecycle of command interpolation. */
export function useMapNavigation(
  svgRef: RefObject<SVGSVGElement | null>,
  layerRef: RefObject<SVGGElement | null>,
  options: NavigationOptions,
) {
  const latest = useRef(options)
  useLayoutEffect(() => {
    latest.current = options
  })
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const animation = useRef<gsap.core.Tween | null>(null)
  const generation = useRef(0)
  const reduced = useRef(false)
  const manualView = useRef(false)
  const gesturing = useRef(false)
  const previousSize = useRef({ width: 0, height: 0 })

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: reduce)', () => {
        reduced.current = true
        // Finish only an active command, never an old target after a manual gesture.
        animation.current?.progress(1)
        return () => {
          reduced.current = false
        }
      })
      return () => media.revert()
    },
    { scope: svgRef },
  )

  useLayoutEffect(() => {
    const svg = svgRef.current,
      layer = layerRef.current
    if (!svg || !layer) return
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .touchable(() => true)
      .clickDistance(7)
      .tapDistance(12)
      .filter((event) => {
        const accepted =
          !event.button && (!event.ctrlKey || event.type === 'wheel')
        // At a zoom limit D3 may skip start/end; the gesture still cancels motion.
        if (accepted && animation.current) {
          manualView.current = true
          animation.current.kill()
          animation.current = null
          svg.dataset.animating = 'false'
          svg.classList.remove('is-moving')
          latest.current.onStatus({
            k: zoomTransform(svg).k,
            minZoom: minimumZoom(
              latest.current.worldBounds,
              latest.current.viewport,
            ),
            moving: false,
          })
        }
        return accepted
      })
      .extent(() => [
        [0, 0],
        [latest.current.width, latest.current.height],
      ])
      .constrain((transform) => {
        const current = latest.current
        const next = constrainView(
          transform,
          current.worldBounds,
          current.viewport,
        )
        return zoomIdentity.translate(next.x, next.y).scale(next.k)
      })
      .on('start.atlas', (event) => {
        if (event.sourceEvent) {
          manualView.current = true
          gesturing.current = true
          animation.current?.kill()
          animation.current = null
          svg.dataset.animating = 'false'
          latest.current.onStatus({
            k: event.transform.k,
            minZoom: minimumZoom(
              latest.current.worldBounds,
              latest.current.viewport,
            ),
            moving: true,
          })
        }
        svg.classList.add('is-moving')
      })
      .on('zoom.atlas', (event) => {
        const { transform } = event
        layer.setAttribute('transform', transform.toString())
        svg.dataset.zoom = String(transform.k)
        svg.dataset.cameraX = String(transform.x)
        svg.dataset.cameraY = String(transform.y)
        latest.current.onZoom(
          transform.k,
          minimumZoom(latest.current.worldBounds, latest.current.viewport),
        )
        layer
          .querySelectorAll<SVGCircleElement>('.country-marker')
          .forEach((marker) =>
            marker.setAttribute('r', String(7 / transform.k)),
          )
      })
      .on('end.atlas', (event) => {
        if (event.sourceEvent) gesturing.current = false
        if (animation.current?.isActive()) return
        svg.classList.remove('is-moving')
        latest.current.onStatus({
          k: event.transform.k,
          minZoom: minimumZoom(
            latest.current.worldBounds,
            latest.current.viewport,
          ),
          moving: false,
        })
      })
    behaviorRef.current = behavior
    const selection = select(svg)
    selection.call(behavior).on('dblclick.zoom', null)
    return () => {
      animation.current?.kill()
      animation.current = null
      gesturing.current = false
      svg.classList.remove('is-moving')
      svg.dataset.animating = 'false'
      latest.current.onStatus({
        k: zoomTransform(svg).k,
        minZoom: minimumZoom(
          latest.current.worldBounds,
          latest.current.viewport,
        ),
        moving: false,
      })
      behaviorRef.current = null
      selection.on('.zoom', null)
      select(svg.ownerDocument.defaultView).on(
        'mousemove.zoom mouseup.zoom',
        null,
      )
    }
  }, [svgRef, layerRef])

  useLayoutEffect(() => {
    behaviorRef.current?.scaleExtent([
      minimumZoom(options.worldBounds, options.viewport),
      MAX_ZOOM,
    ])
  }, [options.worldBounds, options.viewport])

  useGSAP(
    (context) => {
      const svg = svgRef.current,
        behavior = behaviorRef.current
      if (!svg || !behavior) return
      const current = latest.current
      const start = zoomTransform(svg)
      const resized =
        previousSize.current.width !== current.width ||
        previousSize.current.height !== current.height
      previousSize.current = { width: current.width, height: current.height }
      const newCommand = generation.current !== current.request.id
      generation.current = current.request.id
      // Closing mobile overlays must not replay the world or country target.
      if (!newCommand && !resized && current.preserveView) {
        manualView.current = true
        return
      }
      if (newCommand || resized) manualView.current = false
      else if (manualView.current) return
      let destination = current.target
      if (
        newCommand &&
        (current.request.action === 'in' || current.request.action === 'out')
      ) {
        const k = Math.max(
          minimumZoom(current.worldBounds, current.viewport),
          Math.min(
            MAX_ZOOM,
            start.k * (current.request.action === 'in' ? 1.6 : 1 / 1.6),
          ),
        )
        const cx = current.frame.x + current.frame.width / 2,
          cy = current.frame.y + current.frame.height / 2
        destination = {
          k,
          x: cx - ((cx - start.x) / start.k) * k,
          y: cy - ((cy - start.y) / start.k) * k,
        }
      }
      const next = constrainView(
        destination,
        current.worldBounds,
        current.viewport,
      )
      const apply = (value: ViewTransform) =>
        select(svg).call(
          behavior.transform,
          zoomIdentity.translate(value.x, value.y).scale(value.k),
        )
      const finish = () => {
        animation.current = null
        svg.dataset.animating = 'false'
        svg.classList.remove('is-moving')
        const actual = zoomTransform(svg)
        latest.current.onStatus({
          k: actual.k,
          minZoom: minimumZoom(
            latest.current.worldBounds,
            latest.current.viewport,
          ),
          moving: false,
        })
      }
      if (
        resized ||
        reduced.current ||
        (Math.abs(start.k - next.k) < 0.0001 &&
          Math.abs(start.x - next.x) < 0.1 &&
          Math.abs(start.y - next.y) < 0.1)
      ) {
        svg.dataset.animating = 'false'
        apply(next)
        return
      }
      const tweened = { x: start.x, y: start.y, k: start.k }
      svg.dataset.animating = 'true'
      current.onStatus({
        k: next.k,
        minZoom: minimumZoom(current.worldBounds, current.viewport),
        moving: true,
      })
      // D3 owns the live camera: cleanup must kill interpolation without
      // reverting the proxy and replaying its old coordinates through onUpdate.
      context.ignore(() => {
        animation.current = gsap.to(tweened, {
          ...next,
          duration: 0.44,
          ease: 'power2.out',
          onUpdate: () => apply(tweened),
          onComplete: finish,
        })
      })
      return () => {
        animation.current?.kill()
        animation.current = null
        svg.dataset.animating = 'false'
        if (!gesturing.current) finish()
      }
    },
    {
      scope: svgRef,
      dependencies: [options.target, options.request.id],
      revertOnUpdate: true,
    },
  )
}
