// OCR is a SECONDARY, OPTIONAL feature. It only fills the manual form.
// It must never save automatically and must never break the rest of the app.
// All Tesseract usage is dynamically imported and wrapped in try/catch.

export interface OcrResult {
  ticketNo?: string
  truckNo?: string
  gross?: number
  tare?: number
  rawText: string
}

// Attempt to read numeric fields from a ticket photo.
// Throws on failure; callers must fall back to manual entry.
export async function runOcr(
  image: File | Blob | string,
  onProgress?: (p: number) => void,
): Promise<OcrResult> {
  // Dynamic import so a missing/broken dependency never breaks the build/app.
  const Tesseract = await import('tesseract.js')

  const { data } = await Tesseract.recognize(image as unknown as string, 'eng', {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  const text = data.text ?? ''
  return { ...extractFields(text), rawText: text }
}

// Very lightweight heuristic parsing of the recognized text.
// The user always verifies these values in the manual form.
export function extractFields(text: string): Omit<OcrResult, 'rawText'> {
  const result: Omit<OcrResult, 'rawText'> = {}
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean)

  const numbersIn = (s: string): number[] =>
    (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => Number(n.replace(',', '.')))

  for (const line of lines) {
    const lower = line.toLowerCase()
    if (/(ticket|تذكرة|n[°o])/.test(lower) && result.ticketNo === undefined) {
      const nums = numbersIn(line)
      if (nums.length) result.ticketNo = String(nums[0])
    }
    if (/(truck|شاحنة|camion|matricule)/.test(lower) && result.truckNo === undefined) {
      const nums = numbersIn(line)
      if (nums.length) result.truckNo = String(nums[0])
    }
    if (/(brut|gross|إجمالي)/.test(lower) && result.gross === undefined) {
      const nums = numbersIn(line)
      if (nums.length) result.gross = nums[nums.length - 1]
    }
    if (/(tare|فارغة|شاحنة فارغة)/.test(lower) && result.tare === undefined) {
      const nums = numbersIn(line)
      if (nums.length) result.tare = nums[nums.length - 1]
    }
  }

  return result
}
