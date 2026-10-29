'use client'

import Link from 'next/link'
import { useState } from 'react'
import { WHATSAPP_NUMBER, whatsappHref } from '@/lib/contact'

/**
 * The panel after the home page's first screen: on the left, type a message
 * and it opens straight into a WhatsApp chat with Che; on the right, start a
 * project.
 */
const DISPLAY_NUMBER = WHATSAPP_NUMBER.replace(/^44/, '0').replace(/^(\d{5})(\d{6})$/, '$1 $2')

export function ContactSplit() {
  const [text, setText] = useState('')

  function send(e: React.FormEvent) {
    e.preventDefault()
    window.open(whatsappHref(text.trim() || undefined), '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="contact" className="split" aria-label="Get in touch">
      <div className="split-text">
        <div className="split-glow" aria-hidden="true" />
        <div className="split-in">
          <p className="split-k">Message me directly · {DISPLAY_NUMBER}</p>
          <form className="split-form" onSubmit={send} noValidate>
            <label htmlFor="split-msg" className="sr">
              Your message
            </label>
            <input id="split-msg" type="text" placeholder="Hi Che, I need a website for…" value={text} onChange={(e) => setText(e.target.value)} />
            <button type="submit" className="split-go">
              Message me
            </button>
          </form>
          <p className="split-note">Opens WhatsApp with your message ready to send. No calls.</p>
        </div>
      </div>
      <Link href="/start" className="split-start">
        <span className="split-k">or get your first website built free</span>
        <span className="split-big">
          Start a project <span aria-hidden="true">→</span>
        </span>
      </Link>
    </section>
  )
}
