import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { siteApi } from '@/api'
import type { SiteSettings } from '@/types'

const DEFAULT_SETTINGS: SiteSettings = {
  platform_name: 'Isoko',
  logo: null,
  primary_color: '#24344D',
  secondary_color: '#E8A33D',
  homepage_banner: null,
  footer_contact_email: '',
  footer_whatsapp_link: '',
  footer_telegram_link: '',
  default_commission_rate: '0.5',
}

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS)

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8000'

function resolveMediaUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_ORIGIN}${path}`
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    siteApi
      .settings()
      .then((res) =>
        setSettings({
          ...res,
          logo: resolveMediaUrl(res.logo),
          homepage_banner: resolveMediaUrl(res.homepage_banner),
        })
      )
      .catch(() => {
        /* fall back to defaults silently — branding isn't critical-path */
      })
  }, [])

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}