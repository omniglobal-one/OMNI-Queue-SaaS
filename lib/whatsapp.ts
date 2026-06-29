export type WhatsAppTemplate = 'next_up' | 'ready' | 'no_show' | 'custom'

export function generateWhatsAppMessage({
  template,
  customerName,
  ticketNumber,
  invoiceNumber,
  businessName,
  waitTime,
  customText,
}: {
  template: WhatsAppTemplate
  customerName: string
  ticketNumber: string
  invoiceNumber: string | null
  businessName: string
  waitTime: number
  customText?: string
}): string {
  const name = customerName || 'Customer'
  switch (template) {
    case 'next_up':
      return `Hi ${name}! Your ticket #${ticketNumber} at ${businessName} is coming up next. Please make your way to the counter now. Thank you!`
    case 'ready':
      return `Hi ${name}! Ticket #${ticketNumber}${invoiceNumber ? ` (Invoice #${invoiceNumber})` : ''} is ready at ${businessName}. Your estimated wait is now ${waitTime} mins. Please come to the counter.`
    case 'no_show':
      return `Hi ${name}, we called your number #${ticketNumber} at ${businessName} but couldn't reach you. Please return to the counter or speak to a staff member. Thank you.`
    case 'custom':
      return customText ?? ''
  }
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const e164 = phone.replace(/^\+/, '')
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`
}
