import type { Ref } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'

export function FloatingSearch({
  open,
  disabled,
  buttonRef,
  onToggle,
}: {
  open: boolean
  disabled: boolean
  buttonRef: Ref<HTMLButtonElement>
  onToggle: () => void
}) {
  return (
    <Button
      ref={buttonRef}
      className="floating-search"
      aria-label="Pesquisar país"
      aria-expanded={open}
      aria-controls="atlas-search"
      disabled={disabled}
      onClick={onToggle}
    >
      <Icon name="search" />
    </Button>
  )
}
