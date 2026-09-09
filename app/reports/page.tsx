'use client'

import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/Header'
import { getTickets, getSettings, getPreviousDayTotal, todayString } from '@/lib/storage'
import { calculateDailyStats, calculateGlobalTotal } from '@/lib/calculations'
import { getShiftLabel } from '@/lib/shifts'
import type { Ticket, DailySettings } from '@/lib/types'

export default function ReportsPage() {
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [settings, setSettings] = useState<DailySettings | null>(null)
  const [date, setDate] = useState(todayString())
  const [shiftFilter, setShiftFilter] = useState<'all' | number>('all')
  const [truckFilter, setTruckFilter] = useState<string>('all')

  useEffect(() => {
    setAllTickets(getTickets())
    setSettings(getSettings())
  }, [])

  const dayTickets = useMemo(
    () => allTickets.filter((t) => t.date === date),
    [allTickets, date],
  )

  const trucks = useMemo(
    () => Array.from(new Set(dayTickets.map((t) => t.truckNo).filter(Boolean))),
    [dayTickets],
  )

  const filtered = useMemo(
    () =>
      dayTickets.filter(
        (t) =>
          (shiftFilter === 'all' || t.shift === shiftFilter) &&
          (truckFilter === 'all' || t.truckNo === truckFilter),
      ),
    [dayTickets, shiftFilter, truckFilter],
  )

  const stats = calculateDailyStats(filtered)
  const dayTotalNet = calculateDailyStats(dayTickets).totalNet
  const previousTotal = settings ? getPreviousDayTotal(settings, date) : 0
  const globalTotal = calculateGlobalTotal(previousTotal, dayTotalNet)

  const netByShift = useMemo(() => {
    return [1, 2, 3].map((s) => ({
      shift: s,
      net: dayTickets.filter((t) => t.shift === s).reduce((sum, t) => sum + t.net, 0),
    }))
  }, [dayTickets])
  const maxNet = Math.max(1, ...netByShift.map((x) => x.net))

  const selectClass =
    'w-full rounded-2xl border border-border bg-card px-3 py-2 text-card-foreground outline-none focus:ring-2 focus:ring-ring'

  const statItems = [
    { label: 'عدد التذاكر', value: stats.count },
    { label: 'مجموع Brut', value: stats.totalGross },
    { label: 'مجموع Tare', value: stats.totalTare },
    { label: 'مجموع Net', value: stats.totalNet, accent: true },
    { label: 'T. Antérieur', value: previousTotal },
    { label: 'Cumul (اليوم)', value: dayTotalNet },
  ]

  return (
    <main className="min-h-dvh bg-background pb-10">
      <Header title="📊 التقارير" subtitle="محسوبة من البيانات الحقيقية" backHref="/" />

      <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
        {/* Filters */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-sm font-bold text-muted-foreground">اليوم</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={selectClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-bold text-muted-foreground">
                  الوردية
                </label>
                <select
                  value={shiftFilter}
                  onChange={(e) =>
                    setShiftFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className={selectClass}
                >
                  <option value="all">الكل</option>
                  <option value={1}>الوردية 1</option>
                  <option value={2}>الوردية 2</option>
                  <option value={3}>الوردية 3</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-muted-foreground">
                  الشاحنة
                </label>
                <select
                  value={truckFilter}
                  onChange={(e) => setTruckFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">الكل</option>
                  {trucks.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p
                className={`mt-1 text-2xl font-extrabold tabular-nums ${
                  item.accent ? 'text-manual' : 'text-card-foreground'
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Total Global highlight */}
        <div className="rounded-2xl bg-header p-5 text-header-foreground shadow-sm">
          <p className="text-sm text-white/80">Total Global (T. Antérieur + Cumul)</p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums">{globalTotal}</p>
        </div>

        {/* Net by shift chart */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-card-foreground">
            الوزن الصافي حسب الوردية
          </h2>
          <div className="flex flex-col gap-3">
            {netByShift.map((row) => (
              <div key={row.shift} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm font-bold text-muted-foreground">
                  {getShiftLabel(row.shift)}
                </span>
                <div className="h-8 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-full bg-manual px-2 text-sm font-bold text-manual-foreground transition-all"
                    style={{ width: `${(row.net / maxNet) * 100}%` }}
                  >
                    {row.net > 0 ? row.net : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
