import React from 'react'
import { motion } from 'framer-motion'
import { FiBarChart2, FiShield, FiSmartphone } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi'

const features = [
  {
    icon: HiOutlineSparkles,
    title: 'Ask-first AI assistant',
    description:
      'Chat with TrackIt about your money like you would with a friend. No formulas, no dashboards overload.',
    badge: 'AI-native',
  },
  {
    icon: FiBarChart2,
    title: 'Intuitive financial dashboard',
    description:
      'See income vs expenses, category breakdowns, and trends in a clean, distraction-free view.',
    badge: 'Clarity',
  },
  {
    icon: FiShield,
    title: 'Secure by design',
    description:
      'Encrypted communication, sensible defaults, and privacy-first architecture from day one.',
    badge: 'Secure',
  },
  {
    icon: FiSmartphone,
    title: 'Works where you live',
    description:
      'Responsive layout that feels at home on your laptop during deep dives and on mobile on the go.',
    badge: 'Responsive',
  },
]

const FeatureGrid = () => {
  return (
    <section className="border-t border-slate-200/60 bg-white text-slate-900 dark:border-trackit-border/70 dark:bg-trackit-background dark:text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              A calmer way to understand money
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              TrackIt helps you zoom out of spreadsheets and into clear, guided insights — powered by
              your data and an integrated AI assistant.
            </p>
          </div>
          <p className="text-xs text-trackit-muted">Designed for students, freelancers, and young professionals who want control without overwhelm.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="cursor-pointer group flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-black/5 ease-in-out duration-300 hover:-translate-y-1 hover:border-trackit-accent/70 hover:shadow-xl hover:shadow-emerald-500/30 dark:border-trackit-border/80 dark:bg-slate-950/60"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-400/40 group-hover:bg-emerald-500/15">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="rounded-full bg-slate-100/80 px-2 py-0.5 text-[0.65rem] font-medium text-trackit-muted ring-1 ring-slate-200/80 group-hover:text-emerald-300 group-hover:ring-emerald-400/60 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-trackit-border/60">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{feature.title}</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{feature.description}</p>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureGrid
