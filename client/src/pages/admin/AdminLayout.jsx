import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiActivity, FiBarChart2, FiHome, FiSettings, FiUsers } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { toggleSidebar } from '../../store/slices/layoutSlice'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'
import DashboardNavbar from '../../components/user/DashboardNavbar.jsx'
import Sidebar from '../../components/user/Sidebar.jsx'

const adminSidebarItems = [
  { icon: FiHome, label: 'Command center', path: '/admin/dashboard' },
  { icon: FiUsers, label: 'User oversight', path: '/admin/users' },
  { icon: FiActivity, label: 'System health', path: '/admin/system-health' },
  { icon: FiBarChart2, label: 'Reports', path: '/admin/reports' },
  { icon: FiSettings, label: 'Settings', path: '/admin/settings' },
]

const headerAnimation = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const GuardedMessage = ({ title, description, actionLabel, actionLink }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-trackit-background dark:text-slate-50">
    <Navbar />
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 text-center">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-black/5 dark:border-trackit-border dark:bg-slate-900/60">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
        <Link
          to={actionLink}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-300/80 bg-emerald-500/80 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5"
        >
          {actionLabel}
        </Link>
      </section>
    </main>
    <Footer />
  </div>
)

const AdminLayout = () => {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin'
  const sidebarOpen = useSelector((state) => state.layout.sidebarOpen)
  const mainPadding = sidebarOpen ? 'lg:pl-[256px]' : 'lg:pl-[96px]'
  const handleToggleSidebar = () => dispatch(toggleSidebar())

  if (!isAuthenticated) {
    return (
      <GuardedMessage
        title="Admin dashboard"
        description="Sign in with an administrator account to review compliance, health, and operations."
        actionLabel="Sign in as admin"
        actionLink="/signin"
      />
    )
  }

  if (!isAdmin) {
    return (
      <GuardedMessage
        title="Access denied"
        description="You are signed in, but your account does not have administrator privileges."
        actionLabel="Return to user dashboard"
        actionLink="/dashboard"
      />
    )
  }

  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-trackit-background dark:text-slate-50 relative overflow-x-hidden">
      <DashboardNavbar sidebarOpen={sidebarOpen} onToggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} menuItems={adminSidebarItems} />
      <main className={`w-full transition-all duration-300 ${mainPadding} pt-20 px-4 sm:px-6 lg:pr-8`}>
        <motion.section
          key={location.pathname}
          className="mb-6 border-b border-slate-200 pb-4 dark:border-trackit-border/60"
          variants={headerAnimation}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">Administrator dashboard</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Command center</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span>Signed in as {user?.name}</span>
              <span className="rounded-full border border-emerald-200 px-3 py-0.5 text-[0.65rem] uppercase tracking-[0.3em] text-emerald-600">
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Coordinate teams, oversee policies, and keep the platform resilient.
            </p>
          </div>
        </motion.section>

        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
