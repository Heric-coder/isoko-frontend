import { useEffect, useState } from 'react'
import { supportApi } from '@/api'
import { Spinner } from '@/components/Spinner'

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  admin_response: string
  created_at: string
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  const load = () => {
    supportApi.myTickets().then((res: any) => setTickets(res.results || res)).finally(() => setIsLoading(false))
  }
  useEffect(load, [])

  const sendReply = async (id: string) => {
    await supportApi.reply(id, replies[id] || '', statuses[id] || 'resolved')
    load()
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Support Tickets</h1>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="card p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-medium">{ticket.subject}</p>
              <span className="text-xs capitalize text-indigo-500">{ticket.status.replace(/_/g, ' ')}</span>
            </div>
            <p className="mb-3 text-sm text-indigo-700 dark:text-indigo-100">{ticket.message}</p>

            <textarea
              className="input mb-2"
              placeholder="Write a reply…"
              rows={2}
              defaultValue={ticket.admin_response}
              onChange={(e) => setReplies((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
            />
            <div className="flex gap-2">
              <select
                className="input w-40"
                defaultValue={ticket.status}
                onChange={(e) => setStatuses((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <button onClick={() => sendReply(ticket.id)} className="btn-primary !px-4 !py-1.5 text-sm">Reply</button>
            </div>
          </div>
        ))}
        {tickets.length === 0 && <p className="text-indigo-500">No tickets.</p>}
      </div>
    </div>
  )
}
