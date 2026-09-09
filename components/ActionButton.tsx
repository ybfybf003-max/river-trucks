'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'manual' | 'camera' | 'reports' | 'settings' | 'export' | 'danger' | 'neutral'
type Size = 'lg' | 'md'

const variantClasses: Record<Variant, string> = {
  manual: 'bg-manual text-manual-foreground',
  camera: 'bg-camera text-camera-foreground',
  reports: 'bg-reports text-reports-foreground',
  settings: 'bg-settings text-settings-foreground',
  export: 'bg-export text-export-foreground',
  danger: 'bg-danger text-danger-foreground',
  neutral: 'bg-card text-card-foreground border border-border',
}

interface ActionButtonProps {
  label: string
  emoji?: string
  subtitle?: string
  variant?: Variant
  size?: Size
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  children?: ReactNode
}

export function ActionButton({
  label,
  emoji,
  subtitle,
  variant = 'neutral',
  size = 'md',
  href,
  onClick,
  disabled,
  type = 'button',
  className,
}: ActionButtonProps) {
  const base = cn(
    'flex items-center gap-3 w-full rounded-2xl font-bold shadow-sm',
    'transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
    size === 'lg' ? 'px-5 py-6 text-xl' : 'px-4 py-4 text-base',
    variantClasses[variant],
    className,
  )

  const content = (
    <>
      {emoji ? (
        <span className={cn('leading-none', size === 'lg' ? 'text-4xl' : 'text-2xl')} aria-hidden>
          {emoji}
        </span>
      ) : null}
      <span className="flex flex-col items-start text-right">
        <span>{label}</span>
        {subtitle ? (
          <span className="text-sm font-normal opacity-90">{subtitle}</span>
        ) : null}
      </span>
    </>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={base}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {content}
    </button>
  )
}
