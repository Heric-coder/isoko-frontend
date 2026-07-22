import { useEffect, useState } from 'react'
import { notificationsApi } from '@/api'
import { useAuth } from '@/context/AuthContext'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const load = () => {
    notificationsApi.list().then((res: any) => setNotifications(res.results || res))
  }

  useEffect(() => {
    if (!user) return
    load()
    // Simple polling — fine for a lightweight app; swap for websockets later if needed.
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) return null

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleOpen = async () => {
    setOpen((v) => !v)
    if (!open && unreadCount > 0) {
      await notificationsApi.markAllRead()
      load()
    }
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} aria-label="Notifications" className="relative text-indigo-500 hover:text-indigo-900 dark:text-indigo-100">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-clay-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="card absolute right-0 top-10 max-h-96 w-72 overflow-y-auto p-2 text-sm" onMouseLeave={() => setOpen(false)}>
          {notifications.length === 0 && <p className="p-3 text-indigo-500">No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n.id} className={`rounded p-2 ${n.is_read ? '' : 'bg-indigo-50 dark:bg-ink-soft'}`}>
              <p className="font-medium">{n.title}</p>
              <p className="text-xs text-indigo-500">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
