import React from 'react'
import { motion } from 'framer-motion'

const flaggedUsers = [
  { name: 'Sanjay Patel', reason: 'Multiple device logins', status: 'Under review', risk: 'High' },
  { name: 'Ava Martinez', reason: 'Volume spike', status: 'Cleared', risk: 'Low' },
  { name: 'Brooke Chen', reason: 'Disputed charge wave', status: 'Escalated', risk: 'Medium' },
]

const approvalQueue = [
  { stage: 'Identity photo match', count: 12 },
  { stage: 'Bank validation', count: 8 },
  { stage: 'AML refresh', count: 5 },
]

const animationVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const UserOversight = () => (
  <motion.div className="space-y-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Flagged accounts</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Manual reviews in motion</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Updated 5m ago</span>
      </header>
      <div className="mt-6 space-y-4">
        {flaggedUsers.map((user) => (
          <motion.article
            key={user.name}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40"
            variants={animationVariant}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{user.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{user.reason}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Risk {user.risk}</span>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Status: {user.status}</p>
          </motion.article>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Automation queue</p>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Where approvals stall</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {approvalQueue.map((stage) => (
          <motion.article
            key={stage.stage}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40"
            variants={animationVariant}
          >
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{stage.count}</p>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{stage.stage}</p>
          </motion.article>
        ))}
      </div>
    </section>
  </motion.div>
)

export default UserOversight
