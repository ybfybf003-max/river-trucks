'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Ticket } from '@/lib/types'
import { getShiftLabel } from '@/lib/shifts'

interface TicketCardProps {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
}

function Field({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-bold tabular-nums ${accent ? 'text-manual' : 'text-card-foreground'}`}>
        {value}
      </span>
    </div>
  )
}

export function TicketCard({ ticket, onEdit, onDelete }: TicketCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">رقم التذكرة</span>
          <span className="text-lg font-extrabold text-card-foreground">#{ticket.ticketNo}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground">رقم الشاحنة</span>
          <span className="text-lg font-extrabold text-card-foreground">{ticket.truckNo || '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 py-3">
        <Field label="Brut" value={ticket.gross} />
        <Field label="Tare" value={ticket.tare} />
        <Field label="Net" value={ticket.net} accent />
        <Field label="Cumul" value={ticket.cumul} />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
          {getShiftLabel(ticket.shift)} · {ticket.time}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(ticket)}
            className="flex items-center gap-1 rounded-xl bg-camera/10 px-3 py-2 text-sm font-bold text-camera active:scale-95"
          >
            <Pencil className="h-4 w-4" />
            تعديل
          </button>
          <button
            type="button"
            onClick={() => onDelete(ticket)}
            className="flex items-center gap-1 rounded-xl bg-danger/10 px-3 py-2 text-sm font-bold text-danger active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </button>
        </div>
      </div>
    </div>
  )
}
