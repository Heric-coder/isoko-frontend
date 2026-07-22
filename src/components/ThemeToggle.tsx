import { useTheme } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="flex h-8 w-8 items-center justify-center rounded-full text-indigo-500 hover:bg-indigo-50 dark:text-indigo-100 dark:hover:bg-ink-soft"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
