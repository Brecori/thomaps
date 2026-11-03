import { countryColor } from '@/styles/map-palette'
import { useMemo, useRef, useState } from 'react'
import { geoGraticule10, geoPath } from 'd3-geo'
import { createProjection, targetView } from '@/domain/atlas/geometry'
import type { AtlasData } from '@/domain/atlas/schema'
import type { AtlasLayout } from '@/hooks/useAtlasLayout'
import {
  useMapNavigation,
  type NavigationRequest,
  type NavigationStatus,
} from '@/hooks/useMapNavigation'
import { useMapGestureGuard } from '@/hooks/useMapGestureGuard'
import { countryLabels } from '@/domain/atlas/labels'
import { useMapLabels } from '@/hooks/useMapLabels'

type WorldMapProps = {
  data: AtlasData
  selectedId: string | null
  layout: AtlasLayout
  request: NavigationRequest
  onSelect: (id: string, origin: SVGElement) => void
  onDeselect: () => void
  onStatus: (status: NavigationStatus) => void
}

export function WorldMap({
  data,
  selectedId,
  layout,
  request,
  onSelect,
  onDeselect,
  onStatus,
}: WorldMapProps) {
  const svg = useRef<SVGSVGElement>(null)
  const layer = useRef<SVGGElement>(null)
  const labelLayer = useRef<SVGGElement>(null)
  const guard = useMapGestureGuard()
  const hoverRef = useRef<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const hover = (id: string | null) => {
    if (hoverRef.current !== id) {
      hoverRef.current = id
      setHoveredId(id)
    }
  }
  const selected = data.countries.find((country) => country.id === selectedId)
  const viewport = useMemo(
    () => ({ x: 0, y: 0, width: layout.width, height: layout.height }),
    [layout.width, layout.height],
  )
  const projection = useMemo(() => createProjection(viewport), [viewport])
  const path = useMemo(() => geoPath(projection).digits(2), [projection])
  const target = useMemo(
    () =>
      targetView(selected, data.features, projection, layout.frame, viewport),
    [selected, data.features, projection, layout.frame, viewport],
  )
  const worldBounds = useMemo(() => path.bounds({ type: 'Sphere' }), [path])
  const owners = useMemo(
    () =>
      new Map(
        data.countries.flatMap((country) =>
          country.mapFeatureIds.map((id) => [id, country] as const),
        ),
      ),
    [data.countries],
  )
  const shapes = useMemo(
    () =>
      data.features.map((shape) => ({
        shape,
        country: owners.get(shape.id),
        d: path(shape) ?? '',
        fill: countryColor(shape.properties.continent),
      })),
    [data.features, owners, path],
  )
  const markers = useMemo(
    () =>
      data.countries.flatMap((country) => {
        const owned = data.features.filter((shape) =>
          country.mapFeatureIds.includes(shape.id),
        )
        const bounds = path.bounds({
          type: 'FeatureCollection',
          features: owned,
        })
        const area =
          (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1])
        const point = projection(country.focusPoint)
        return area < 30 && point ? [{ country, point }] : []
      }),
    [data.countries, data.features, path, projection],
  )
  const labels = useMemo(
    () => countryLabels(data.countries, data.features, projection),
    [data.countries, data.features, projection],
  )
  const updateLabels = useMapLabels(labelLayer, labels)
  useMapNavigation(svg, layer, {
    ...layout,
    viewport,
    target,
    worldBounds,
    request,
    onStatus,
    onZoom: updateLabels,
  })
  return (
    <div className="world-map">
      <p className="sr-only" id="map-instructions">
        Toque ou clique em um país. Arraste para mover e use a pinça ou os
        botões para aproximar. Pelo teclado, selecione um país com Enter ou
        espaço. A ajuda também permite escolher pelo nome.
      </p>
      <svg
        ref={svg}
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="group"
        aria-label="Mapa-múndi interativo"
        aria-describedby="map-instructions"
        {...guard}
        onPointerDownCapture={(event) => {
          guard.onPointerDownCapture(event)
          hover(null)
        }}
        onPointerMoveCapture={(event) => {
          guard.onPointerMoveCapture(event)
          if (
            event.pointerType !== 'mouse' ||
            event.currentTarget.classList.contains('is-moving')
          )
            return
          hover(
            (event.target as Element)
              .closest('[data-country-id]')
              ?.getAttribute('data-country-id') ?? null,
          )
        }}
        onPointerLeave={() => hover(null)}
        onWheelCapture={() => hover(null)}
        onClick={(event) => {
          if (
            selectedId &&
            !event.defaultPrevented &&
            !(event.target as Element).closest('[data-country-id]')
          )
            onDeselect()
        }}
        onFocusCapture={(event) => {
          const element = event.target as SVGElement
          setFocusedId(
            element.matches(':focus-visible')
              ? element.getAttribute('data-country-id')
              : null,
          )
        }}
        onBlurCapture={() => setFocusedId(null)}
      >
        <g ref={layer} className="world-map__layer">
          <path
            d={path({ type: 'Sphere' }) ?? ''}
            className="world-map__ocean"
            aria-hidden="true"
          />
          <path
            d={path(geoGraticule10()) ?? ''}
            className="world-map__graticule"
            aria-hidden="true"
          />
          {shapes.map(({ shape, country, d, fill }) => (
            <path
              key={shape.id}
              d={d}
              fill={fill}
              className={`country-shape ${country?.id === selectedId ? 'is-selected' : ''} ${!country ? 'is-context' : ''}`}
              data-country-id={country?.id}
              data-feature-id={shape.id}
              vectorEffect="non-scaling-stroke"
              role={country ? 'button' : undefined}
              aria-label={country?.namePtBr}
              aria-pressed={country ? country.id === selectedId : undefined}
              aria-hidden={!country || undefined}
              tabIndex={
                country
                  ? country.id === (selectedId ?? 'BRA')
                    ? 0
                    : -1
                  : undefined
              }
              onClick={
                country
                  ? (event) => {
                      if (!event.defaultPrevented)
                        onSelect(country.id, event.currentTarget)
                    }
                  : undefined
              }
              onKeyDown={
                country
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelect(country.id, event.currentTarget)
                      }
                    }
                  : undefined
              }
            >
              {country && <title>{country.namePtBr}</title>}
            </path>
          ))}
          {/* Separate strokes are painted after every fill, so neighbors cannot cover them. */}
          <g
            className="world-map__outlines"
            aria-hidden="true"
            pointerEvents="none"
          >
            {[
              { id: selectedId, state: 'selected' },
              {
                id: hoveredId !== selectedId ? hoveredId : null,
                state: 'hover',
              },
              { id: focusedId, state: 'focus' },
            ].flatMap(({ id, state }) =>
              id
                ? shapes
                    .filter((item) => item.country?.id === id)
                    .map((item) => (
                      <path
                        key={`${state}-${item.shape.id}`}
                        d={item.d}
                        className={`country-outline country-outline--${state}`}
                        data-country-id={id}
                        vectorEffect="non-scaling-stroke"
                      />
                    ))
                : [],
            )}
          </g>
          <g
            ref={labelLayer}
            className="world-map__labels"
            aria-hidden="true"
            pointerEvents="none"
          >
            {labels.map((label) => (
              <text
                key={label.id}
                x={label.x}
                y={label.y}
                data-radius={label.radius}
                data-label-country={label.id}
                className="country-label"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {label.lines.map((line, index) => (
                  <tspan
                    key={index}
                    x={label.x}
                    dy={
                      index === 0
                        ? `${-0.6 * (label.lines.length - 1)}em`
                        : '1.2em'
                    }
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            ))}
          </g>
          {markers.map(({ country, point }) => (
            <circle
              key={country.id}
              cx={point[0]}
              cy={point[1]}
              r={7}
              vectorEffect="non-scaling-stroke"
              className={`country-marker ${country.id === selectedId ? 'is-selected' : ''}`}
              data-country-id={country.id}
              role="button"
              aria-label={`${country.namePtBr} — marcador`}
              aria-pressed={country.id === selectedId}
              tabIndex={-1}
              onClick={(event) => {
                if (!event.defaultPrevented)
                  onSelect(country.id, event.currentTarget)
              }}
            >
              <title>{country.namePtBr}</title>
            </circle>
          ))}
        </g>
      </svg>
    </div>
  )
}
