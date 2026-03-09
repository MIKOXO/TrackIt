import React from 'react'
import { motion } from 'framer-motion'
import { FiAlertCircle, FiFileText, FiClock } from 'react-icons/fi'

const problems = [
  {
    icon: FiAlertCircle,
    title: 'Mystery Money',
    description:
      'You know you make enough to live comfortably, but somehow at the end of the month there\'s nothing left. You can\'t figure out where your money went.',
  },
  {
    icon: FiFileText,
    title: 'Overwhelming Spreadsheets',
    description:
      'You\'ve tried budgeting apps and Excel sheets, but they\'re either too complicated or require too much manual work. So you give up after a few days.',
  },
  {
    icon: FiClock,
    title: 'Time Sinks',
    description:
      'Tracking expenses feels like a part-time job. Between receipts, categories, and manual entries, you don\'t have time for your actual life.',
  },
]

const ProblemSection = () => {
  return (
    <section className="border-t border-slate-200/60 bg-white text-slate-900 dark:border-trackit-border/70 dark:bg-trackit-foreground/60 dark:text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            Does this sound familiar?
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            The struggle with personal finances is real for millions of people
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {problems.map((problem, index) => {
            const Icon = problem.icon

            return (
              <motion.article
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="cursor-pointer rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 shadow-sm shadow-black/5 ease-in-out duration-300 hover:-translate-y-1 hover:border-trackit-accent/70 hover:shadow-xl hover:shadow-emerald-500/30 dark:border-trackit-border/80 dark:bg-slate-950/60"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-400/40">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{problem.title}</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{problem.description}</p>
              </motion.article>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 shadow-sm shadow-black/5 dark:border-trackit-border/80 dark:bg-slate-950/60"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">The Result?</h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            Financial stress, missed opportunities, and a constant feeling of being behind.
            Sound familiar? You're not alone – and there's a better way.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default ProblemSection