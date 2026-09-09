// Export / backup helpers. Browser-compatible file generation with
// optional Android Web Share support.

import type { Ticket, DailySettings } from './types'
import { getTickets, getSettings, getBackups } from './storage'

const CSV_HEADER = [
  'Date',
  'Time',
  'Ticket No',
  'Truck No',
  'Gross',
  'Tare',
  'Net',
  'Cumul',
  'Shift',
  'DUM',
  'Navire',
  'Produit',
  'Client',
]

function csvEscape(value: string | number): string {
  const s = String(value ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function buildCsv(tickets: Ticket[], settings: DailySettings): string {
  const rows = tickets.map((t) =>
    [
      t.date,
      t.time,
      t.ticketNo,
      t.truckNo,
      t.gross,
      t.tare,
      t.net,
      t.cumul,
      t.shift,
      settings.dum,
      settings.navire,
      settings.produit,
      settings.client,
    ]
      .map(csvEscape)
      .join(','),
  )
  return [CSV_HEADER.join(','), ...rows].join('\n')
}

export function csvFilename(date: string): string {
  return `River_${date}.csv`
}

export function buildBackupJson(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      tickets: getTickets(),
      settings: getSettings(),
      backups: getBackups(),
    },
    null,
    2,
  )
}

// Trigger a browser download for text content.
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Share via the Web Share API (Android) when possible, else fall back to download.
export async function shareOrDownload(
  filename: string,
  content: string,
  mime: string,
): Promise<'shared' | 'downloaded'> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  try {
    if (nav && 'canShare' in nav && typeof File !== 'undefined') {
      const file = new File([content], filename, { type: mime })
      // @ts-expect-error canShare with files is not in all TS lib versions
      if (nav.canShare({ files: [file] })) {
        // @ts-expect-error share with files is not in all TS lib versions
        await nav.share({ files: [file], title: filename })
        return 'shared'
      }
    }
  } catch {
    // fall through to download
  }
  downloadFile(filename, content, mime)
  return 'downloaded'
}

export interface ParsedBackup {
  tickets?: Ticket[]
  settings?: DailySettings
}

export function parseBackupJson(text: string): ParsedBackup {
  const data = JSON.parse(text)
  return { tickets: data.tickets, settings: data.settings }
}
