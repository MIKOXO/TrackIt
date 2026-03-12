import React from 'react'
import { motion } from 'framer-motion'
import { FiServer, FiShield, FiCloud } from 'react-icons/fi'

const systemMetrics = [
  { icon: FiServer, label: 'API heartbeats', value: '1,248/s', note: '99.9% success this hour' },
  { icon: FiShield, label: 'Security scans', value: '73 policies', note: 'All signatures up-to-date' },
  { icon: FiCloud, label: 'Sync jobs', value: '48 active', note: 'Average runtime 4.2s' },
]

const datacenters = [
  { name: 'US East', latency: '12 ms', status: 'Nominal' },
  { name: 'EU Central', latency: '18 ms', status: 'Nominal' },
  { name: 'AP South', latency: '21 ms', status: 'Observing' },
]

const upcomingDrills = [
  { name: 'Failover walkthrough', due: 'Mar 20', scope: 'Database replicas' },
  { name: 'Cache refresh audit', due: 'Mar 21', scope: 'Redis cluster' },
]

const sectionVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const SystemHealth = () => (
  <motion.div className="space-y-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
    <section className="grid gap-6 md:grid-cols-3">
      {systemMetrics.map((metric) => (
        <motion.article
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
          variants={sectionVariant}
        >
          <div className="flex items-center justify-between">
            <metric.icon className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{metric.label}</p>
          </div>
          <p className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">{metric.value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{metric.note}</p>
        </motion.article>
      ))}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Datacenter overview</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Latency + posture</h2>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Live</span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {datacenters.map((center) => (
          <motion.article
            key={center.name}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40"
            variants={sectionVariant}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{center.name}</p>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{center.status}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{center.latency}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg latency</p>
          </motion.article>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Upcoming drills</p>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Reliability calendar</h2>
      <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-400">
        {upcomingDrills.map((drill) => (
          <motion.div key={drill.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-trackit-border dark:bg-slate-900/40" variants={sectionVariant}>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">{drill.name}</p>
              <p>{drill.scope}</p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Due {drill.due}</span>
          </motion.div>
        ))}
      </div>
    </section>
  </motion.div>
)

export default SystemHealth
