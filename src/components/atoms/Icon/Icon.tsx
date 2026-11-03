import {
  ArrowUpRight,
  Compass,
  Earth,
  Hand,
  Heart,
  Info,
  MapPin,
  Mic,
  Minus,
  Music2,
  Plus,
  Search,
  Volume2,
  X,
} from 'lucide-react'

const icons = {
  arrow: ArrowUpRight,
  compass: Compass,
  earth: Earth,
  hand: Hand,
  heart: Heart,
  info: Info,
  pin: MapPin,
  mic: Mic,
  minus: Minus,
  music: Music2,
  plus: Plus,
  search: Search,
  volume: Volume2,
  close: X,
}
export type IconName = keyof typeof icons

export function Icon({
  name,
  size = 24,
  className = '',
}: {
  name: IconName
  size?: number
  className?: string
}) {
  const Glyph = icons[name]
  return (
    <Glyph
      size={size}
      strokeWidth={2.3}
      aria-hidden="true"
      focusable="false"
      className={className}
    />
  )
}
