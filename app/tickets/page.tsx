'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { TicketCard } from '@/components/TicketCard'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ActionButton } from '@/components/ActionButton'
import { Toast, type ToastState } from '@/components/Toast'
import { getTodayTickets, deleteTicket, todayString } from '@/lib/storage'
import { calculateDailyStats } from '@/lib/calculations'
import type { Ticket } from '@/lib/types'

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [pendingDelete, setPendingDelete] = useState<Ticket | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  function refresh() {
    setTickets(getTodayTickets(todayString()))
  }

  useEffect(() => {
    refresh()
  }, [])

  const stats = calculateDailyStats(tickets)

  function confirmDelete() {
    if (!pendingDelete) return
    deleteTicket(pendingDelete.id)
    setPendingDelete(null)
    setToast({ kind: 'success', message: 'تم حذف التذكرة وإعادة حساب المجموع.' })
    refresh()
  }

  return (
    <main className="min-h-dvh bg-background pb-10">
      <Header title="📋 تذاكر اليوم" subtitle={todayString()} backHref="/" />
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">عدد التذاكر</p>
            <p className="text-2xl font-extrabold tabular-nums">{stats.count}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">مجموع Net</p>
            <p className="text-2xl font-extrabold tabular-nums text-manual">{stats.totalNet}</p>
          </div>
        </div>

        <ActionButton
          href="/manual"
          variant="manual"
          emoji="✏️"
          label="إضافة تذكرة جديدة"
        />

        {tickets.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-lg font-bold text-card-foreground">لا توجد تذاكر اليوم</p>
            <p className="mt-1 text-muted-foreground">
              ابدأ بإدخال أول تذكرة عبر زر الإدخال اليدوي.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onEdit={(t) => router.push(`/manual?id=${t.id}`)}
                onDelete={(t) => setPendingDelete(t)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف التذكرة"
        message={
          pendingDelete
            ? `هل تريد حذف التذكرة رقم #${pendingDelete.ticketNo}؟ لا يمكن التراجع عن هذا الإجراء.`
            : ''
        }
        confirmLabel="حذف"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  )
}
