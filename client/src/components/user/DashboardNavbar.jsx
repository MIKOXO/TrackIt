import React from 'react'
import { FiTrendingUp, FiChevronLeft } from 'react-icons/fi'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import { useSelector } from 'react-redux'

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

const DashboardNavbar = ({ sidebarOpen, onToggleSidebar }) => {
  const [isDark, setIsDark] = React.useState(getInitialTheme)
  const { user } = useSelector((state) => state.auth)

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
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-trackit-border/60 dark:bg-slate-900/95">
      <nav className="flex items-center justify-between gap-4 px-6 py-4">
        {/* Left - Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800/50"
          aria-label="Toggle sidebar"
        >
          <FiChevronLeft className={`h-5 w-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
        </button>

        {/* Center - Logo */}
        <div className="flex items-center gap-2 pl-14 lg:pl-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-trackit-accent to-emerald-500">
            <FiTrendingUp className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">TrackIt</span>
            <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">Dashboard</span>
          </div>
        </div>

        {/* Right - Theme Toggle & Avatar */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/60 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-500 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-emerald-400"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <HiOutlineSun className="h-4 w-4" />
            ) : (
              <HiOutlineMoon className="h-4 w-4" />
            )}
          </button>

          {/* User Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-semibold text-white cursor-pointer hover:shadow-lg hover:shadow-emerald-500/40 transition">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default DashboardNavbar
