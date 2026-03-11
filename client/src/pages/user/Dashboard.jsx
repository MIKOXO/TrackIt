import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'

const userHighlights = [
  { value: '62%', title: 'Savings goal progress', subtitle: 'toward March target' },
  { value: '$2,140', title: 'This month’s spend', subtitle: 'down 8% from last month' },
  { value: '3', title: 'Upcoming bills', subtitle: 'due in the next 7 days' },
]

const UserDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-trackit-background dark:text-slate-50">
        <Navbar />
        <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 text-center">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-black/5 dark:border-trackit-border dark:bg-slate-900/60">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Dashboard</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Sign in to unlock personalized insights, habit nudges, and the AI coach that powers TrackIt’s budgeting tools.
            </p>
            <Link
              to="/signin"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-emerald-300/80 bg-emerald-500/80 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5"
            >
              Sign in to continue
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
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-500">Welcome back, {user?.name?.split(' ')[0]}</p>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Your dashboard</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Track spending, stay ahead of bills, and let AI surface the smartest next move.
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Signed in as <span className="font-semibold text-slate-900 dark:text-slate-50">{user?.name}</span>
              <span className="ml-2 rounded-full border border-emerald-200 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-emerald-600">
                {user?.role ?? 'user'}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {userHighlights.map((highlight) => (
            <article
              key={highlight.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{highlight.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{highlight.title}</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{highlight.subtitle}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Habit builder</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Keep a streak of weekly check-ins and see how each insight nudges your spending behavior.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Trusted AI coach</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ask about savings goals, subscriptions, or how to stretch payroll—TrackIt keeps private data local.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default UserDashboard
