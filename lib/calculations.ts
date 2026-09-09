// Centralized calculation helpers. All numeric logic lives here.

import type { Ticket, DailyStats } from './types'

// Net = Gross - Tare, never negative.
export function calculateNet(gross: number, tare: number): number {
  const g = Number.isFinite(gross) ? gross : 0
  const t = Number.isFinite(tare) ? tare : 0
  return Math.max(g - t, 0)
}

// Recalculate cumulative net for a list of tickets in chronological (array) order.
// Returns a new array with updated `cumul` values.
export function calculateCumul(tickets: Ticket[]): Ticket[] {
  let running = 0
  return tickets.map((ticket) => {
    running += ticket.net
    return { ...ticket, cumul: running }
  })
}

export function calculateDailyStats(tickets: Ticket[]): DailyStats {
  return tickets.reduce<DailyStats>(
    (acc, t) => {
      acc.count += 1
      acc.totalGross += t.gross
      acc.totalTare += t.tare
      acc.totalNet += t.net
      return acc
    },
    { count: 0, totalGross: 0, totalTare: 0, totalNet: 0 },
  )
}

export function calculateGlobalTotal(previousTotal: number, currentTotal: number): number {
  return (previousTotal || 0) + (currentTotal || 0)
}
