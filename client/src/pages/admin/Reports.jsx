import React from 'react'
import { motion } from 'framer-motion'
import { FiBarChart2, FiCalendar } from 'react-icons/fi'

const reportSchedule = []

const insightSignals = []

const reportVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const Reports = () => (
  <motion.div className="space-y-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Scheduled reports</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Turnaround times</h2>
        </div>
        <FiCalendar className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="mt-6 space-y-4">
        {reportSchedule.map((report) => (
          <motion.article
            key={report.title}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between"
            variants={reportVariant}
          >
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{report.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {report.cadence} · {report.channel} · {report.owner}
              </p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{report.time}</span>
          </motion.article>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Insight signal</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Quick read</h2>
        </div>
        <FiBarChart2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {insightSignals.map((signal) => (
          <motion.article
            key={signal.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40"
            variants={reportVariant}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{signal.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{signal.value}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{signal.trend}</p>
          </motion.article>
        ))}
      </div>
    </section>
  </motion.div>
)

export default Reports
