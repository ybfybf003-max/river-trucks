'use client'

import { useMemo, useState } from 'react'
import { calculateNet } from '@/lib/calculations'
import { getShiftLabel } from '@/lib/shifts'

export interface TicketFormValues {
  ticketNo: string
  truckNo: string
  gross: number
  tare: number
  net: number
  shift: number
}

export interface TicketFormInitial {
  ticketNo?: string
  truckNo?: string
  gross?: number | string
  tare?: number | string
  shift?: number
}

interface TicketFormProps {
  initial?: TicketFormInitial
  defaultShift: number
  submitLabel?: string
  onSubmit: (values: TicketFormValues) => void
  onCancel: () => void
}

function toStr(v: number | string | undefined): string {
  if (v === undefined || v === null) return ''
  return String(v)
}

export function TicketForm({
  initial,
  defaultShift,
  submitLabel = '💾 حفظ التذكرة',
  onSubmit,
  onCancel,
}: TicketFormProps) {
  const [ticketNo, setTicketNo] = useState(toStr(initial?.ticketNo))
  const [truckNo, setTruckNo] = useState(toStr(initial?.truckNo))
  const [gross, setGross] = useState(toStr(initial?.gross))
  const [tare, setTare] = useState(toStr(initial?.tare))
  const [shift, setShift] = useState<number>(initial?.shift ?? defaultShift)
  const [error, setError] = useState<string | null>(null)

  const grossNum = gross.trim() === '' ? NaN : Number(gross)
  const tareNum = tare.trim() === '' ? NaN : Number(tare)

  const net = useMemo(() => {
    if (!Number.isFinite(grossNum) || !Number.isFinite(tareNum)) return null
    return calculateNet(grossNum, tareNum)
  }, [grossNum, tareNum])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (ticketNo.trim() === '') {
      setError('يرجى إدخال رقم التذكرة.')
      return
    }
    if (!Number.isFinite(grossNum) || grossNum < 0) {
      setError('يرجى إدخال وزن إجمالي (Brut) صحيح.')
      return
    }
    if (!Number.isFinite(tareNum) || tareNum < 0) {
      setError('يرجى إدخال وزن الشاحنة (Tare) صحيح.')
      return
    }
    setError(null)
    onSubmit({
      ticketNo: ticketNo.trim(),
      truckNo: truckNo.trim(),
      gross: grossNum,
      tare: tareNum,
      net: calculateNet(grossNum, tareNum),
      shift,
    })
  }

  const inputClass =
    'w-full rounded-2xl border border-border bg-card px-4 py-3 text-lg text-card-foreground outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'mb-1 block text-sm font-bold text-muted-foreground'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="ticketNo" className={labelClass}>
          رقم التذكرة
        </label>
        <input
          id="ticketNo"
          value={ticketNo}
          onChange={(e) => setTicketNo(e.target.value)}
          inputMode="numeric"
          className={inputClass}
          placeholder="مثال: 1024"
        />
      </div>

      <div>
        <label htmlFor="truckNo" className={labelClass}>
          رقم الشاحنة
        </label>
        <input
          id="truckNo"
          value={truckNo}
          onChange={(e) => setTruckNo(e.target.value)}
          className={inputClass}
          placeholder="مثال: 4521"
        />
      </div>

      <div>
        <label htmlFor="gross" className={labelClass}>
          الوزن الإجمالي Brut
        </label>
        <input
          id="gross"
          value={gross}
          onChange={(e) => setGross(e.target.value)}
          inputMode="decimal"
          type="number"
          min={0}
          className={inputClass}
          placeholder="0"
        />
      </div>

      <div>
        <label htmlFor="tare" className={labelClass}>
          وزن الشاحنة Tare
        </label>
        <input
          id="tare"
          value={tare}
          onChange={(e) => setTare(e.target.value)}
          inputMode="decimal"
          type="number"
          min={0}
          className={inputClass}
          placeholder="0"
        />
      </div>

      <div>
        <span className={labelClass}>الوزن الصافي Net (محسوب تلقائياً)</span>
        <div className="flex items-center justify-between rounded-2xl border-2 border-manual/30 bg-manual/10 px-4 py-3">
          <span className="text-sm text-muted-foreground">Net = Brut - Tare</span>
          <span className="text-2xl font-extrabold tabular-nums text-manual">
            {net === null ? '—' : net}
          </span>
        </div>
        {net === null ? (
          <p className="mt-1 text-sm text-muted-foreground">
            أدخل Brut و Tare لحساب الوزن الصافي.
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="shift" className={labelClass}>
          الوردية
        </label>
        <select
          id="shift"
          value={shift}
          onChange={(e) => setShift(Number(e.target.value))}
          className={inputClass}
        >
          {[1, 2, 3].map((s) => (
            <option key={s} value={s}>
              {getShiftLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="rounded-2xl bg-danger/10 px-4 py-3 font-bold text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-2 flex flex-col gap-3">
        <button
          type="submit"
          className="w-full rounded-2xl bg-manual px-4 py-4 text-lg font-bold text-manual-foreground shadow-sm active:scale-[0.98]"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-lg font-bold text-card-foreground active:scale-[0.98]"
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}
