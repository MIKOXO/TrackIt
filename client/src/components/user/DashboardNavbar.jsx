import React from 'react'
import { FiChevronLeft } from 'react-icons/fi'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { toggleTheme } from '../../store/slices/themeSlice'

const DashboardNavbar = ({ sidebarOpen, onToggleSidebar }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const theme = useSelector((state) => state.theme.mode)
  const isDark = theme === 'dark'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200/60 bg-white dark:border-trackit-border/60 dark:bg-slate-900">
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
        <Link to="/dashboard" className="flex items-center gap-2 pl-14 lg:pl-0">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Track<span className="text-trackit-accent">It.</span>
          </span>
        </Link>

        {/* Right - Theme Toggle & Avatar */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
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
