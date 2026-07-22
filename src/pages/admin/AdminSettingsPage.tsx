import { useEffect, useState, type FormEvent } from 'react'
import { api } from '@/api/client'
import { siteApi } from '@/api'
import { Spinner } from '@/components/Spinner'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import type { SiteSettings } from '@/types'

interface Broadcast {
  id: string
  title: string
  message_en: string
  target: string
  is_active: boolean
}

function BrandingForm() {
  const currentSettings = useSiteSettings()
  const [form, setForm] = useState<SiteSettings>(currentSettings)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => setForm(currentSettings), [currentSettings])

  const update = (key: keyof SiteSettings, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    await siteApi.updateSettings(form)
    setSavedMessage('Saved! Refresh to see changes reflected across the site.')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <form onSubmit={handleSave} className="card space-y-3 p-4">
      <h2 className="font-semibold">Branding</h2>
      <div>
        <label className="label">Platform name</label>
        <input className="input" value={form.platform_name} onChange={(e) => update('platform_name', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Primary color</label>
          <input type="color" className="input h-10" value={form.primary_color} onChange={(e) => update('primary_color', e.target.value)} />
        </div>
        <div>
          <label className="label">Secondary color</label>
          <input type="color" className="input h-10" value={form.secondary_color} onChange={(e) => update('secondary_color', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Contact email</label>
        <input className="input" value={form.footer_contact_email} onChange={(e) => update('footer_contact_email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">WhatsApp link</label>
          <input className="input" value={form.footer_whatsapp_link} onChange={(e) => update('footer_whatsapp_link', e.target.value)} />
        </div>
        <div>
          <label className="label">Telegram link</label>
          <input className="input" value={form.footer_telegram_link} onChange={(e) => update('footer_telegram_link', e.target.value)} />
        </div>
      </div>
      <button type="submit" className="btn-primary">Save branding</button>
      {savedMessage && <p className="text-sm text-leaf-500">{savedMessage}</p>}
    </form>
  )
}

function CommissionForm() {
  const [rate, setRate] = useState('0.5')
  const [retroactive, setRetroactive] = useState(false)
  const [result, setResult] = useState('')

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    const res = await siteApi.updateCommission(parseFloat(rate), retroactive) as { applied_retroactively_to: number }
    setResult(retroactive ? `Applied to ${res.applied_retroactively_to} open orders.` : 'Applied to new orders only.')
  }

  return (
    <form onSubmit={handleSave} className="card space-y-3 p-4">
      <h2 className="font-semibold">Commission</h2>
      <div>
        <label className="label">Default commission rate (%)</label>
        <input type="number" step="0.1" className="input" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={retroactive} onChange={(e) => setRetroactive(e.target.checked)} />
        Apply retroactively to open orders (otherwise applies to new orders only)
      </label>
      <button type="submit" className="btn-primary">Update commission</button>
      {result && <p className="text-sm text-leaf-500">{result}</p>}
    </form>
  )
}

function BroadcastsPanel() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [title, setTitle] = useState('')
  const [messageEn, setMessageEn] = useState('')
  const [target, setTarget] = useState('all')

  const load = () => api.get<{ results: Broadcast[] } | Broadcast[]>('/adminpanel/broadcasts/').then((res: any) => setBroadcasts(res.results || res))
  useEffect(() => { load() }, [])

  const create = async (e: FormEvent) => {
    e.preventDefault()
    await api.post('/adminpanel/broadcasts/', { title, message_en: messageEn, target, is_active: true })
    setTitle('')
    setMessageEn('')
    load()
  }

  return (
    <div className="card space-y-3 p-4">
      <h2 className="font-semibold">Broadcasts</h2>
      <form onSubmit={create} className="space-y-2">
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="input" placeholder="Message" rows={2} value={messageEn} onChange={(e) => setMessageEn(e.target.value)} required />
        <select className="input" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="all">Everyone</option>
          <option value="buyers">Buyers</option>
          <option value="sellers">Sellers</option>
        </select>
        <button type="submit" className="btn-accent">Publish broadcast</button>
      </form>

      <div className="space-y-2 border-t border-indigo-100 pt-3 dark:border-ink-soft">
        {broadcasts.map((b) => (
          <div key={b.id} className="text-sm">
            <span className="font-medium">{b.title}</span>
            <span className="ml-2 text-xs text-indigo-500">({b.target})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => setIsLoading(false), [])
  if (isLoading) return <Spinner />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">Site Settings</h1>
      <BrandingForm />
      <CommissionForm />
      <BroadcastsPanel />
    </div>
  )
}
