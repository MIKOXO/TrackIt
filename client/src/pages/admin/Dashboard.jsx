import React from 'react'
import { motion } from 'framer-motion'
import { FiShield, FiActivity, FiUsers, FiZap, FiLayers } from 'react-icons/fi'

const highlightInsights = [
  {
    icon: FiShield,
    label: 'Compliance verified',
    value: '482 reviews',
    detail: 'Completed this week with zero escalations',
  },
  {
    icon: FiActivity,
    label: 'Incident coverage',
    value: '17 active monitors',
    detail: 'Ops team assigned for 99% of alerts',
  },
  {
    icon: FiUsers,
    label: 'VIP accounts flagged',
    value: '64 attention needed',
    detail: 'Review queue cleared every 2 hrs',
  },
  {
    icon: FiZap,
    label: 'Automation uptime',
    value: '100% critical flows',
    detail: 'Background checks and webhooks healthy',
  },
]

const incidentQueue = [
  {
    title: 'Delayed KYC refresh',
    severity: 'High',
    impact: 'Pending identity refresh for 18 accounts',
    owner: 'Trust Ops',
    eta: '2h',
  },
  {
    title: 'API throughput spike',
    severity: 'Medium',
    impact: 'Third-party ingestion hitting rate caps',
    owner: 'Platform',
    eta: '45m',
  },
  {
    title: 'Billing webhook failure',
    severity: 'Low',
    impact: 'Retrying 4 invoices every 15m',
    owner: 'Finance',
    eta: '15m',
  },
]

const strategyBoard = [
  {
    title: 'Policy refresh sprint',
    status: 'In progress',
    description: 'Align automated outreach with the new onboarding guardrails.',
    owner: 'Risk & Compliance',
    due: 'Mar 18',
  },
  {
    title: 'Expedite VIP cohort',
    status: 'Needs input',
    description: 'Approve feature toggles for the expanded beta pool.',
    owner: 'PM + Product Ops',
    due: 'Mar 22',
  },
  {
    title: 'Datacenter failover drill',
    status: 'Scheduled',
    description: 'Confirm rollback playbook with engineering leads.',
    owner: 'Reliability',
    due: 'Mar 26',
  },
]

const badgeStyles = {
  In: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  Needs: 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  Scheduled: 'bg-slate-100/80 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
}

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const AdminDashboard = () => (
  <motion.div className="space-y-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.09 } } }}>
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {highlightInsights.map((insight) => (
        <motion.article
          key={insight.label}
          className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
          variants={cardVariant}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{insight.label}</p>
            <insight.icon className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-50">{insight.value}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{insight.detail}</p>
        </motion.article>
      ))}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Incident queue</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">What needs attention</h2>
        </div>
        <span className="text-xs tracking-[0.3em] text-slate-500 dark:text-slate-400">Updated 3m ago</span>
      </div>
      <div className="mt-6 space-y-4">
      {incidentQueue.map((incident) => (
        <motion.article
          key={incident.title}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40"
          variants={cardVariant}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{incident.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{incident.impact}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] ${
                  incident.severity === 'High'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                    : incident.severity === 'Medium'
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                }`}
              >
                {incident.severity}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span>Owner: {incident.owner}</span>
              <span>ETA: {incident.eta}</span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Strategy board</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Next moves</h2>
        </div>
        <FiLayers className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {strategyBoard.map((item) => (
        <motion.article
          key={item.title}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40"
          variants={cardVariant}
        >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{item.title}</h3>
              <span
                className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] ${
                  badgeStyles[item.status.split(' ')[0]] ?? badgeStyles.Scheduled
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
            <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              <span>{item.owner}</span>
              <span>Due {item.due}</span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  </motion.div>
)

export default AdminDashboard
