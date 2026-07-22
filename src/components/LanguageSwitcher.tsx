import { useLanguage } from '@/context/LanguageContext'

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex shrink-0 overflow-hidden rounded-full border border-indigo-100 text-xs font-semibold dark:border-ink-soft">
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 transition-colors ${lang === 'en' ? 'bg-indigo-700 text-white' : 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-ink-soft'}`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLang('rw')}
        className={`px-2.5 py-1 transition-colors ${lang === 'rw' ? 'bg-indigo-700 text-white' : 'text-indigo-500 hover:bg-indigo-50 dark:hover:bg-ink-soft'}`}
        aria-pressed={lang === 'rw'}
      >
        RW
      </button>
    </div>
  )
}
