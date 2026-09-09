// Shift detection logic.
//
// Shift 1: 07:00 -> 14:59
// Shift 2: 15:00 -> 22:59
// Shift 3: 23:00 -> 06:59

export function getCurrentShift(date: Date = new Date()): number {
  const hour = date.getHours()
  if (hour >= 7 && hour < 15) return 1
  if (hour >= 15 && hour < 23) return 2
  return 3
}

export function getShiftLabel(shift: number): string {
  return `الوردية ${shift}`
}

export function getShiftRange(shift: number): string {
  switch (shift) {
    case 1:
      return '07:00 - 15:00'
    case 2:
      return '15:00 - 23:00'
    default:
      return '23:00 - 07:00'
  }
}
