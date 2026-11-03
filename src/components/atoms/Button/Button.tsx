import type { ComponentProps, ReactNode } from 'react'

export type ButtonProps = ComponentProps<'button'> & {
  tone?: 'primary' | 'purple' | 'soft' | 'plain'
  children: ReactNode
}

export function Button({
  tone = 'plain',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${tone} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
