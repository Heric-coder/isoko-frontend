import { useLanguage } from '@/context/LanguageContext'
import { useSiteSettings } from '@/context/SiteSettingsContext'

export function Footer() {
  const { platform_name, footer_contact_email, footer_whatsapp_link, footer_telegram_link } = useSiteSettings()
  const { t } = useLanguage()

  return (
    <footer className="mt-12 border-t border-indigo-100 bg-white py-8 dark:border-ink-soft dark:bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-indigo-500 sm:flex-row sm:items-center sm:justify-between dark:text-indigo-300">
        <p>&copy; {new Date().getFullYear()} {platform_name}. All rights reserved.</p>

        <div className="flex flex-wrap gap-4">
          {footer_contact_email && (
            <a href={`mailto:${footer_contact_email}`} className="hover:text-indigo-900 dark:hover:text-white">
              {t('footer_contact')}
            </a>
          )}
          {footer_whatsapp_link && (
            <a href={footer_whatsapp_link} target="_blank" rel="noreferrer" className="hover:text-indigo-900 dark:hover:text-white">
              {t('footer_whatsapp')}
            </a>
          )}
          {footer_telegram_link && (
            <a href={footer_telegram_link} target="_blank" rel="noreferrer" className="hover:text-indigo-900 dark:hover:text-white">
              {t('footer_telegram')}
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
