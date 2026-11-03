import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior } from 'd3-zoom'
import gsap from 'gsap'
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
  onStatus: (status: NavigationStatus) => void
  onZoom: (k: number, minimum: number) => void
}

/** D3 owns every camera update; GSAP only interpolates commands through zoom.transform. */
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

  useLayoutEffect(() => {
    const svg = svgRef.current,
      layer = layerRef.current
    if (!svg || !layer) return
    const selection = select(svg)
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .touchable(() => true)
      .clickDistance(7)
      .tapDistance(12)
      .filter(
        (event) => !event.button && (!event.ctrlKey || event.type === 'wheel'),
      )
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
          animation.current?.kill()
          svg.dataset.animating = 'false'
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
        svg.classList.remove('is-moving')
        if (!animation.current?.isActive())
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
    selection.call(behavior).on('dblclick.zoom', null)
    return () => {
      animation.current?.kill()
      behaviorRef.current = null
      selection.on('.zoom', null)
      // D3 temporarily listens on the window while dragging; cancel on unmount too.
      select(svg.ownerDocument.defaultView).on(
        'mousemove.zoom mouseup.zoom',
        null,
      )
    }
  }, [svgRef, layerRef])

  const moveTo = (target: ViewTransform, animate = true) => {
    const svg = svgRef.current,
      behavior = behaviorRef.current
    if (!svg || !behavior) return
    animation.current?.kill()
    const current = latest.current
    const next = constrainView(target, current.worldBounds, current.viewport)
    const apply = (value: ViewTransform) =>
      select(svg).call(
        behavior.transform,
        zoomIdentity.translate(value.x, value.y).scale(value.k),
      )
    const start = zoomTransform(svg)
    if (
      !animate ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      svg.dataset.animating = 'false'
      apply(next)
      return
    }
    const tweened = { x: start.x, y: start.y, k: start.k }
    svg.dataset.animating = 'true'
    animation.current = gsap.to(tweened, {
      ...next,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate: () => apply(tweened),
      onComplete: () => {
        animation.current = null
        svg.dataset.animating = 'false'
        latest.current.onStatus({
          k: next.k,
          minZoom: minimumZoom(
            latest.current.worldBounds,
            latest.current.viewport,
          ),
          moving: false,
        })
      },
    })
  }
  const moveRef = useRef(moveTo)
  useLayoutEffect(() => {
    moveRef.current = moveTo
  })

  const previousSize = useRef({ width: 0, height: 0 })
  useLayoutEffect(() => {
    behaviorRef.current?.scaleExtent([
      minimumZoom(options.worldBounds, options.viewport),
      MAX_ZOOM,
    ])
  }, [options.worldBounds, options.viewport])
  useLayoutEffect(() => {
    const current = latest.current
    const animate =
      previousSize.current.width === current.width &&
      previousSize.current.height === current.height
    previousSize.current = { width: current.width, height: current.height }
    moveRef.current(current.target, animate)
  }, [options.target])

  useEffect(() => {
    if (options.request.id === generation.current) return
    generation.current = options.request.id
    const svg = svgRef.current
    if (!svg) return
    if (
      options.request.action === 'world' ||
      options.request.action === 'focus'
    ) {
      moveRef.current(latest.current.target)
      return
    }
    const current = zoomTransform(svg),
      frame = latest.current.frame
    const k = Math.max(
      minimumZoom(latest.current.worldBounds, latest.current.viewport),
      Math.min(
        MAX_ZOOM,
        current.k * (options.request.action === 'in' ? 1.6 : 1 / 1.6),
      ),
    )
    const cx = frame.x + frame.width / 2,
      cy = frame.y + frame.height / 2
    moveRef.current({
      k,
      x: cx - ((cx - current.x) / current.k) * k,
      y: cy - ((cy - current.y) / current.k) * k,
    })
  }, [options.request, svgRef])
}
