import React from 'react'
import { motion } from 'framer-motion'
import { SPRING, stagger, springUp } from './motionPresets.js'

const shifts = [
  {
    from: 'Tab-hopping between spreadsheets',
    to: 'One dashboard that explains itself',
  },
  {
    from: 'Guessing where the money went',
    to: 'Plain-language answers on demand',
  },
  {
    from: 'Month-end surprises',
    to: 'Budget watch before it bites',
  },
  {
    from: 'Dashboards built to sell your data',
    to: 'Private, encrypted, and yours',
  },
]

const arrow = {
  hidden: { x: -10, opacity: 0 },
  show: { x: 0, opacity: 1, transition: SPRING.snappy },
}

const FeatureGrid = () => {
  return (
    <section
      id="calmer-way"
      className="scroll-mt-24 border-t border-slate-200/60 bg-gradient-to-b from-emerald-50/60 via-white to-white text-slate-900 dark:border-trackit-border/70 dark:from-emerald-500/[0.05] dark:via-trackit-background dark:to-trackit-background dark:text-slate-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger(0.09)}
          className="max-w-2xl"
        >
          <motion.p
            variants={springUp()}
            className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-emerald-500 dark:text-emerald-300"
          >
            The TrackIt way
          </motion.p>
          <motion.h2
            variants={springUp()}
            className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-50"
          >
            Money, minus{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text pb-[0.35em] -mb-[0.35em] text-transparent">
              the noise.
            </span>
          </motion.h2>
          <motion.p variants={springUp()} className="mt-4 text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
            The busywork goes. The signal stays. Here&apos;s what changes.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger(0.12, 0.05)}
          className="mt-14 grid gap-4 sm:grid-cols-2"
        >
          {shifts.map((shift) => (
            <motion.article
              key={shift.to}
              variants={springUp()}
              whileHover={{ y: -4 }}
              transition={SPRING.snappy}
              className="group flex flex-col items-start gap-4 rounded-2xl border border-emerald-900/[0.06] bg-white/80 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] backdrop-blur transition-colors duration-300 hover:border-emerald-400/50 sm:flex-row sm:items-center sm:gap-6 sm:p-6 dark:border-white/[0.06] dark:bg-slate-950/50 dark:hover:border-emerald-400/30"
            >
              <div className="min-w-0 sm:w-[44%]">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  From
                </p>
                <p className="mt-1.5 text-sm text-slate-500 line-through decoration-emerald-400/50 [text-decoration-thickness:1.5px] dark:text-slate-500">
                  {shift.from}
                </p>
              </div>

              <span className="-rotate-90 self-start transition-transform duration-200 group-hover:translate-x-1 sm:rotate-0 sm:self-auto">
                <motion.span
                  variants={arrow}
                  className="block text-xl font-semibold text-emerald-500 dark:text-emerald-300"
                >
                  →
                </motion.span>
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-emerald-500/90 dark:text-emerald-300/80">
                  To
                </p>
                <p className="mt-1.5 text-base font-semibold text-slate-900 dark:text-slate-50">
                  {shift.to}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureGrid
