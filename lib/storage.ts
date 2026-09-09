// Local persistence layer (localStorage). Kept separate from UI.
// Simple, synchronous, and offline-friendly for the first version.

import type { Ticket, DailySettings, DailyBackup } from './types'
import { calculateNet } from './calculations'

const KEYS = {
  tickets: 'riverTrucks_tickets',
  settings: 'riverTrucks_settings',
  backups: 'riverTrucks_backups',
  closedDays: 'riverTrucks_closedDays',
} as const

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable: fail silently, app keeps working in-memory.
  }
}

// ---- Date helpers ----

export function todayString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function nowTimeString(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ---- Tickets ----

export function getTickets(): Ticket[] {
  return read<Ticket[]>(KEYS.tickets, [])
}

function persistTickets(tickets: Ticket[]): void {
  write(KEYS.tickets, tickets)
}

export function getTodayTickets(date: string = todayString()): Ticket[] {
  return getTickets().filter((t) => t.date === date)
}

export function saveTicket(input: Omit<Ticket, 'id' | 'net' | 'cumul'>): Ticket {
  const tickets = getTickets()
  const net = calculateNet(input.gross, input.tare)
  const ticket: Ticket = {
    ...input,
    id: generateId(),
    net,
    cumul: 0,
  }
  tickets.push(ticket)
  const updated = recalcCumul(tickets, ticket.date)
  persistTickets(updated)
  return updated.find((t) => t.id === ticket.id) as Ticket
}

export function updateTicket(id: string, patch: Partial<Ticket>): Ticket | null {
  const tickets = getTickets()
  const idx = tickets.findIndex((t) => t.id === id)
  if (idx === -1) return null
  const merged: Ticket = { ...tickets[idx], ...patch }
  merged.net = calculateNet(merged.gross, merged.tare)
  tickets[idx] = merged
  const updated = recalcCumul(tickets, merged.date)
  persistTickets(updated)
  return updated.find((t) => t.id === id) ?? null
}

export function deleteTicket(id: string): void {
  const tickets = getTickets()
  const target = tickets.find((t) => t.id === id)
  if (!target) return
  const remaining = tickets.filter((t) => t.id !== id)
  const updated = recalcCumul(remaining, target.date)
  persistTickets(updated)
}

export function getTicketById(id: string): Ticket | null {
  return getTickets().find((t) => t.id === id) ?? null
}

// Clean, simple cumul recompute for a date, preserving array order.
function recalcCumul(tickets: Ticket[], date: string): Ticket[] {
  let running = 0
  return tickets.map((t) => {
    if (t.date !== date) return t
    running += t.net
    return { ...t, cumul: running }
  })
}

// ---- Settings ----

export function getSettings(): DailySettings {
  const date = todayString()
  return read<DailySettings>(KEYS.settings, {
    date,
    dum: '',
    navire: '',
    produit: '',
    client: '',
  })
}

export function saveSettings(settings: DailySettings): void {
  write(KEYS.settings, settings)
}

// ---- Daily backups / end of day ----

export function getBackups(): DailyBackup[] {
  return read<DailyBackup[]>(KEYS.backups, [])
}

export function saveDailyBackup(backup: DailyBackup): void {
  const backups = getBackups().filter((b) => b.date !== backup.date)
  backups.push(backup)
  backups.sort((a, b) => a.date.localeCompare(b.date))
  write(KEYS.backups, backups)

  const closed = read<string[]>(KEYS.closedDays, [])
  if (!closed.includes(backup.date)) {
    closed.push(backup.date)
    write(KEYS.closedDays, closed)
  }
}

export function isDayClosed(date: string = todayString()): boolean {
  return read<string[]>(KEYS.closedDays, []).includes(date)
}

// Previous-day total: latest backup strictly before `date`.
// If its settings match the current settings, its total is used as T. Antérieur.
export function getPreviousDayTotal(
  currentSettings?: DailySettings,
  date: string = todayString(),
): number {
  const backups = getBackups()
    .filter((b) => b.date < date)
    .sort((a, b) => b.date.localeCompare(a.date))
  const previous = backups[0]
  if (!previous) return 0
  if (!currentSettings) return previous.totalNet
  const same =
    previous.settings.dum === currentSettings.dum &&
    previous.settings.navire === currentSettings.navire &&
    previous.settings.produit === currentSettings.produit &&
    previous.settings.client === currentSettings.client
  return same ? previous.totalNet : 0
}
