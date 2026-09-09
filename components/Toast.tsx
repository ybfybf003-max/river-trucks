'use client'

import { useEffect } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastState {
  kind: ToastKind
  message: string
}

const styles: Record<ToastKind, string> = {
  success: 'bg-manual text-manual-foreground',
  error: 'bg-danger text-danger-foreground',
  info: 'bg-header text-header-foreground',
}

const icons: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function Toast({
  toast,
  onDismiss,
  duration = 2500,
}: {
  toast: ToastState | null
  onDismiss: () => void
  duration?: number
}) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [toast, duration, onDismiss])

  if (!toast) return null
  const Icon = icons[toast.kind]

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className={`pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-2xl px-4 py-3 font-bold shadow-lg ${styles[toast.kind]}`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span>{toast.message}</span>
      </div>
    </div>
  )
}
