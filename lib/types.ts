// Central type definitions for River Trucks.

export interface Ticket {
  id: string
  ticketNo: string
  truckNo: string
  gross: number
  tare: number
  net: number
  cumul: number
  shift: number
  date: string // YYYY-MM-DD
  time: string // HH:MM
}

export interface DailySettings {
  date: string
  dum: string
  navire: string
  produit: string
  client: string
}

export interface DailyBackup {
  date: string
  settings: DailySettings
  tickets: Ticket[]
  totalNet: number
  closed: boolean
  savedAt: string
}

export interface DailyStats {
  count: number
  totalGross: number
  totalTare: number
  totalNet: number
}
