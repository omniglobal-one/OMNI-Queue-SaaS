export function formatAutoTicketNumber(counter: number): string {
  const letterIndex = Math.floor((counter - 1) / 999)
  const num = ((counter - 1) % 999) + 1
  const letter = String.fromCharCode(65 + letterIndex)
  return `${letter}${String(num).padStart(3, '0')}`
}

export function validateInvoiceNumber(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Invoice number is required'
  if (trimmed.length > 50) return 'Invoice number must be 50 characters or less'
  return null
}
