import React from 'react'
import { FiLogIn } from 'react-icons/fi'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return true
  }

  if (window.document.documentElement.classList.contains('dark')) {
    return true
  }

  const storedPreference = window.localStorage.getItem('theme')
  if (storedPreference === 'light') {
    return false
  }
  if (storedPreference === 'dark') {
    return true
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const Navbar = () => {
  const [isDark, setIsDark] = React.useState(getInitialTheme)

  React.useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    window.localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white text-slate-900 transition-colors duration-300 dark:border-trackit-border/60 dark:bg-trackit-background dark:text-slate-50">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Track<span className="text-trackit-accent">It.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className="flex h-9 w-9 outline-none items-center justify-center rounded-full border border-slate-200/60 bg-white/70 text-slate-500 shadow-sm shadow-black/10 transition hover:border-emerald-300 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-emerald-300"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <HiOutlineSun className="h-4 w-4" />
            ) : (
              <HiOutlineMoon className="h-4 w-4" />
            )}
          </button>

          <Link
            to="/signin"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-gradient-to-r from-emerald-400/80 to-trackit-accent px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Sign in
            <FiLogIn className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
