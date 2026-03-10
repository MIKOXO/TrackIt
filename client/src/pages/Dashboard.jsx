import React from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-trackit-background dark:text-slate-50">
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-black/5 dark:border-trackit-border dark:bg-slate-900/60">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            You are signed in. This space will host financial insights, trends, and tools as TrackIt grows.
          </p>
        </section>
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Quick snapshot</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              TrackIt will soon summarize budgeting, spending, and AI advice right here.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Next steps</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Connect accounts, capture transactions, and unlock recommendations.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Dashboard
