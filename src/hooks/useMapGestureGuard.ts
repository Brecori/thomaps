import { useRef, type PointerEvent, type MouseEvent } from 'react'

/** Prevent a touch drag or pinch from producing a country click afterwards. */
export function useMapGestureGuard() {
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const blockedUntil = useRef(0)
  const down = (event: PointerEvent<SVGSVGElement>) => {
    if (pointers.current.size === 0) blockedUntil.current = 0
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    if (pointers.current.size > 1) blockedUntil.current = Date.now() + 800
  }
  const move = (event: PointerEvent<SVGSVGElement>) => {
    const origin = pointers.current.get(event.pointerId)
    if (
      origin &&
      Math.hypot(origin.x - event.clientX, origin.y - event.clientY) > 7
    )
      blockedUntil.current = Date.now() + 800
  }
  const up = (event: PointerEvent<SVGSVGElement>) => {
    if (blockedUntil.current > Date.now())
      blockedUntil.current = Date.now() + 800
    pointers.current.delete(event.pointerId)
  }
  const click = (event: MouseEvent<SVGSVGElement>) => {
    if (event.detail > 0 && blockedUntil.current > Date.now()) {
      event.preventDefault()
      event.stopPropagation()
    }
  }
  return {
    onPointerDownCapture: down,
    onPointerMoveCapture: move,
    onPointerUpCapture: up,
    onPointerCancelCapture: up,
    onClickCapture: click,
  }
}
