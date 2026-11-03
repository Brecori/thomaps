import { createElement, type HTMLAttributes } from 'react'

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3'
  variant?: 'body' | 'heading' | 'label'
}

export function Text({
  as = 'p',
  variant = 'body',
  className = '',
  ...props
}: TextProps) {
  return createElement(as, {
    ...props,
    className: `text text--${variant} ${className}`,
  })
}
