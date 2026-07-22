import { useEffect, useState, type FormEvent } from 'react'
import { supportApi } from '@/api'
import { Spinner } from '@/components/Spinner'
import { useSiteSettings } from '@/context/SiteSettingsContext'

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  admin_response: string
  created_at: string
}

export default function SupportPage() {
  const { footer_whatsapp_link, footer_telegram_link } = useSiteSettings()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = () => {
    supportApi.myTickets().then((res: any) => setTickets(res.results || res)).finally(() => setIsLoading(false))
  }
  useEffect(load, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await supportApi.create(subject, message)
      setSubject('')
      setMessage('')
      load()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-xl font-bold">Support</h1>
      <p className="mb-6 text-sm text-indigo-500">
        Need a faster answer? Message us on{' '}
        {footer_whatsapp_link && <a href={footer_whatsapp_link} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline dark:text-indigo-100">WhatsApp</a>}
        {footer_whatsapp_link && footer_telegram_link && ' or '}
        {footer_telegram_link && <a href={footer_telegram_link} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline dark:text-indigo-100">Telegram</a>}
        . Or send us a message below.
      </p>

      <form onSubmit={handleSubmit} className="card mb-8 space-y-3 p-4">
        <div>
          <label className="label">Subject</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Sending…' : 'Send message'}
        </button>
      </form>

      <h2 className="mb-3 font-semibold">Your tickets</h2>
      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium">{ticket.subject}</p>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs capitalize text-indigo-700 dark:bg-ink-soft dark:text-indigo-100">
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-indigo-500">{ticket.message}</p>
              {ticket.admin_response && (
                <div className="mt-2 rounded-md bg-leaf-100 p-2 text-xs">
                  <span className="font-semibold">Our reply: </span>{ticket.admin_response}
                </div>
              )}
            </div>
          ))}
          {tickets.length === 0 && <p className="text-sm text-indigo-500">No tickets yet.</p>}
        </div>
      )}
    </div>
  )
}
