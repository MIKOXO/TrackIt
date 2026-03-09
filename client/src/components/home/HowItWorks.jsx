import React from 'react'
import { motion } from 'framer-motion'
import { FiLogIn, FiPieChart, FiZap } from 'react-icons/fi'

const steps = [
  {
    icon: FiLogIn,
    eyebrow: 'Step 01',
    title: 'Capture your reality',
    description:
      'Start by logging your income and expenses — or import them once we connect to your bank or CSVs.',
  },
  {
    icon: FiPieChart,
    eyebrow: 'Step 02',
    title: 'See patterns instantly',
    description:
      'TrackIt categorizes transactions, builds trends, and shows you where money actually flows.',
  },
  {
    icon: FiZap,
    eyebrow: 'Step 03',
    title: 'Ask better questions',
    description:
      'Chat with the AI assistant: “What changed this month?” “What should I watch out for?”',
  },
]

const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden border-t border-slate-200/60 bg-white text-slate-900 dark:border-trackit-border/70 dark:bg-trackit-foreground/60 dark:text-slate-50">
      {/* <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_60%)]" /> */}

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-8 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-emerald-500 dark:text-emerald-300">
            How it works
          </p>
          <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            A clear flow, not another financial chore.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
            TrackIt is designed to move from raw activity to useful answers fast. You add data,
            the product surfaces patterns, and the AI helps you decide what to do next.
          </p>

          <div className="mt-8 flex items-end gap-4 border-b border-slate-200/70 pb-6 dark:border-trackit-border/70">
            <span className="text-5xl font-semibold leading-none text-slate-900 sm:text-6xl dark:text-slate-50">
              3
            </span>
            <p className="max-w-[12rem] text-xs uppercase tracking-[0.2em] text-trackit-muted dark:text-slate-400">
              steps from transactions to clarity
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute left-[1.15rem] top-4 bottom-4 hidden w-px bg-gradient-to-b from-emerald-400/60 via-slate-200 to-transparent sm:block dark:via-trackit-border/70" />

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="grid gap-4 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6"
                >
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-white text-emerald-500 shadow-[0_0_0_6px_rgba(255,255,255,0.92)] dark:bg-trackit-foreground/80 dark:text-emerald-300 dark:shadow-[0_0_0_6px_rgba(15,23,42,0.8)]">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="border-b border-slate-200/70 pb-8 last:border-b-0 last:pb-0 dark:border-trackit-border/70">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-emerald-500 dark:text-emerald-300">
                          {step.eyebrow}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">
                          {step.title}
                        </h3>
                      </div>
                      <span className="text-4xl font-semibold leading-none text-slate-200 dark:text-slate-800">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
