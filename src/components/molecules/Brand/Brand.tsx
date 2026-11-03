import { Icon } from '@/components/atoms/Icon'

export function Brand() {
  return (
    <div className="brand" aria-label="Thomaps">
      <span className="brand__symbol">
        <Icon name="earth" size={32} />
      </span>
      <span>
        tho<span className="brand__accent">maps</span>
        <span className="brand__dot">.</span>
      </span>
    </div>
  )
}
