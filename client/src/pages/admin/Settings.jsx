import React from 'react'
import { motion } from 'framer-motion'

const settingsVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const Settings = () => (
  <motion.div className="space-y-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Admin settings</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Configure role-based policies, notifications, and automation thresholds for the platform.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          { title: 'Alerts', detail: 'Tune severity levels and delivery channels' },
          { title: 'Access control', detail: 'Manage admin groups and MFA policy' },
          { title: 'Automation', detail: 'Control workflows for onboarding & reports' },
          { title: 'Integrations', detail: 'Review connected tools and API keys' },
        ].map((item) => (
          <motion.article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40"
            variants={settingsVariant}
          >
            <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{item.title}</p>
            <p className="mt-1">{item.detail}</p>
          </motion.article>
        ))}
      </div>
    </section>
  </motion.div>
)

export default Settings
