/**
 * How people reach Northbound: a message or an email, never a phone call.
 *
 * WHATSAPP_NUMBER: international format, digits only (07700 900123 →
 * '447700900123'). While it is empty, "Message me" opens an Instagram DM
 * instead, so the button always goes somewhere real.
 */
export const WHATSAPP_NUMBER = '447415273492'

export const INSTAGRAM_HANDLE = 'northboundwebuk'

const GREETING = 'Hi Che, I found Northbound Web and I’d like to talk about a website.'

export function messageHref() {
  if (WHATSAPP_NUMBER) return whatsappHref()
  return `https://ig.me/m/${INSTAGRAM_HANDLE}`
}

/** A WhatsApp chat with Che, with `text` typed in ready to send. */
export function whatsappHref(text: string = GREETING) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export const messageLabel = WHATSAPP_NUMBER ? 'Message me on WhatsApp' : 'Message me on Instagram'
