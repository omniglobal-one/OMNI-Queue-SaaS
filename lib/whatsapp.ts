export type WhatsAppTemplate = 'next_up' | 'ready' | 'no_show' | 'custom'

export function generateWhatsAppMessage({
  template,
  customerName,
  ticketNumber,
  invoiceNumber,
  businessName,
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
  const footer = `_Powered by OMNI Queue_`

  switch (template) {
    case 'next_up': {
      const lines = [
        `🎫 *Queue Update — ${businessName}*`,
        '',
        `Hi ${name}! Your number is almost up.`,
        '',
        `🎟️ *Ticket:* #${ticketNumber}`,
        '',
        `Please make your way to the counter now. We'll be with you shortly!`,
        '',
        footer,
      ]
      return lines.join('\n')
    }
    case 'ready': {
      const lines = [
        `✅ *Your Turn Now — ${businessName}*`,
        '',
        `Hi ${name}! Your ticket is now being called.`,
        '',
        `🎟️ *Ticket:* #${ticketNumber}`,
      ]
      if (invoiceNumber) lines.push(`🧾 *Invoice:* #${invoiceNumber}`)
      lines.push('', `Please come to the counter immediately. Thank you!`, '', footer)
      return lines.join('\n')
    }
    case 'no_show': {
      const lines = [
        `⚠️ *Missed Turn — ${businessName}*`,
        '',
        `Hi ${name}, we called your number but couldn't reach you.`,
        '',
        `🎟️ *Ticket:* #${ticketNumber}`,
        '',
        `Please return to the counter or speak to a staff member.`,
        '',
        footer,
      ]
      return lines.join('\n')
    }
    case 'custom':
      return customText ?? ''
  }
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '').replace(/^\+/, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}
