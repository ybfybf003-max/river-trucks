'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  backHref?: string
}

export function Header({ title, subtitle, backHref }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-header text-header-foreground shadow-md">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="رجوع"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 active:scale-95"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        ) : null}
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold leading-tight text-balance">{title}</h1>
          {subtitle ? <p className="text-sm text-white/80">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  )
}
