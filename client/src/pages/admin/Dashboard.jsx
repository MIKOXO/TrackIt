import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'

const adminHighlights = [
  { title: 'Active users', value: '1,248', subtitle: 'monitored in the last 24h' },
  { title: 'Pending approvals', value: '6', subtitle: 'verifications awaiting review' },
  { title: 'System uptime', value: '99.98%', subtitle: 'rolling 30d availability' },
]

const adminControls = [
  'Audit user onboarding & flag fraudulent signups',
  'Review API health, logs, and rate-limit usage spikes',
  'Release announcements and adjust feature access',
]

const AdminDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin'

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-trackit-background dark:text-slate-50">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 text-center">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-black/5 dark:border-trackit-border dark:bg-slate-900/60">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Admin dashboard</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              You must sign in with an administrator account to access these controls.
            </p>
            <Link
              to="/signin"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-300/80 bg-emerald-500/80 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5"
            >
              Sign in as admin
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-trackit-background dark:text-slate-50">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 text-center">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-black/5 dark:border-trackit-border dark:bg-slate-900/60">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Access denied</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              You are signed in, but your account does not have administrator privileges.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/90 px-6 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
            >
              Return to user dashboard
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-trackit-background dark:text-slate-50">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-black/5 dark:border-trackit-border dark:bg-slate-900/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-500">Administrator dashboard</p>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">System control</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Maintain system health, guard onboarding, and keep everyone on TrackIt secure.
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Signed in as <span className="font-semibold text-slate-900 dark:text-slate-50">{user?.name}</span>
              <span className="ml-2 rounded-full border border-emerald-200 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-emerald-600">
                {user?.role}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {adminHighlights.map((highlight) => (
            <article
              key={highlight.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{highlight.title}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-50">{highlight.value}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{highlight.subtitle}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Control center</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {adminControls.map((control) => (
              <li key={control} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                {control}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default AdminDashboard
