import React from 'react'
import { FiTrendingUp } from 'react-icons/fi'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import {Link} from 'react-router-dom'

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
    <header className="sticky top-0 z-30 border-b border-transparent bg-transparent text-slate-900 transition-colors duration-500 dark:border-slate-800 dark:text-slate-50">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className='flex justify-center items-center gap-2'>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-trackit-accent to-emerald-500 text-white shadow-lg shadow-emerald-500/40">
            <FiTrendingUp className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              TrackIt
            </span>
            <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
              Clarity for every transaction
            </span>
          </div>
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

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-gradient-to-r from-emerald-400/80 to-trackit-accent px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Get started free
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
