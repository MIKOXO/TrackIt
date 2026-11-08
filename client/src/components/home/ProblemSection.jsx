import React, { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { SPRING, stagger, springUp } from './motionPresets.js'

const struggles = [
  {
    num: '01',
    title: 'Money in.',
    highlight: 'Nothing left.',
    line: 'A comfortable income that somehow disappears by month-end.',
  },
  {
    num: '02',
    title: 'Budgeting feels like',
    highlight: 'homework.',
    line: 'Apps and spreadsheets demand more time than they return.',
  },
  {
    num: '03',
    title: 'Charts everywhere.',
    highlight: 'Answers nowhere.',
    line: 'You can see every number and still not know what to change.',
  },
]

const highlightClass =
  'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text pb-[0.35em] -mb-[0.35em] text-transparent'

const GhostNumber = ({ num, index, total, drive, reduced }) => {
  const width = 1 / total
  const start = index * width
  const isLast = index === total - 1

  const range = isLast
    ? [start, start + width * 0.22]
    : [start, start + width * 0.22, start + width * 0.82, start + width]

  const opacity = useTransform(
    drive,
    range,
    isLast ? [0, 0.9] : index === 0 ? [0.9, 0.9, 0.9, 0] : [0, 0.9, 0.9, 0]
  )
  const scale = useTransform(
    drive,
    range,
    isLast ? [1.06, 1] : [1.06, 1, 1, 0.94]
  )

  return (
    <motion.span
      aria-hidden
      style={reduced ? { display: 'none' } : { opacity, scale, y: '-50%' }}
      className="pointer-events-none absolute -right-2 top-1/2 z-0 hidden select-none text-[17rem] font-bold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_rgba(15,23,42,0.09)] lg:block dark:[-webkit-text-stroke:1.5px_rgba(148,163,184,0.16)]"
    >
      {num}
    </motion.span>
  )
}

const Statement = ({ struggle, index, total, drive, reduced }) => {
  const width = 1 / total
  const start = index * width
  const isLast = index === total - 1

  const range = isLast
    ? [start, start + width * 0.22]
    : [start, start + width * 0.22, start + width * 0.82, start + width]

  const opacity = useTransform(
    drive,
    range,
    isLast ? [0, 1] : index === 0 ? [1, 1, 1, 0] : [0, 1, 1, 0]
  )
  const y = useTransform(drive, range, isLast ? [46, 0] : [38, 0, 0, -38])
  const scale = useTransform(drive, range, isLast ? [1.02, 1] : [1.02, 1, 1, 0.985])
  const blur = useTransform(
    drive,
    range,
    isLast
      ? ['blur(6px)', 'blur(0px)']
      : ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(6px)']
  )

  return (
    <motion.div
      style={{ opacity, ...(reduced ? {} : { y, scale, filter: blur }) }}
      className="absolute inset-0 flex items-center"
    >
      <div className="relative max-w-2xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-emerald-500/80 dark:text-emerald-300/70">
          {struggle.num}
        </p>
        <h3 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-50">
          {struggle.title}{' '}
          <span className={highlightClass}>{struggle.highlight}</span>
        </h3>
        <p className="mt-5 max-w-md text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
          {struggle.line}
        </p>
      </div>
    </motion.div>
  )
}

const ProblemSection = () => {
  const wrapRef = useRef(null)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const progression = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.7 })

  useMotionValueEvent(progression, 'change', (latest) => {
    const next = Math.min(struggles.length - 1, Math.floor(latest * struggles.length))
    setActive((prev) => (prev === next ? prev : next))
  })

  return (
    <section className="relative border-t border-slate-200/60 bg-white text-slate-900 dark:border-trackit-border/70 dark:bg-trackit-foreground/60 dark:text-slate-50">
      <div ref={wrapRef} className="relative h-[260vh]">
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.6 }}
              variants={stagger(0.08)}
            >
              <motion.p
                variants={springUp()}
                className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-emerald-500 dark:text-emerald-300"
              >
                The problem
              </motion.p>
              <motion.h2
                variants={springUp()}
                className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50"
              >
                Does this sound{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                  familiar?
                </span>
              </motion.h2>
            </motion.div>

            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="hidden items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400 sm:flex dark:text-slate-500"
            >
              Scroll
              <motion.span
                animate={{ scaleY: [1, 0.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="block h-9 w-px origin-top bg-slate-300 dark:bg-slate-600"
              />
            </motion.div>
          </div>

          <div className="relative mx-auto w-full max-w-6xl flex-1">
            {struggles.map((struggle, index) => (
              <GhostNumber
                key={struggle.num}
                num={struggle.num}
                index={index}
                total={struggles.length}
                drive={progression}
                reduced={reduced}
              />
            ))}
            {struggles.map((struggle, index) => (
              <Statement
                key={struggle.num}
                struggle={struggle}
                index={index}
                total={struggles.length}
                drive={progression}
                reduced={reduced}
              />
            ))}
          </div>

          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 text-xs">
            <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
              <span className="flex h-4 items-center font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                <span className="min-w-[1.4rem] overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={active}
                      initial={{ y: 18, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -18, opacity: 0 }}
                      transition={SPRING.snappy}
                      className="block min-w-[1.4rem]"
                    >
                      0{active + 1}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-slate-400 dark:text-slate-500">/ 03</span>
              </span>
              <div className="h-[3px] max-w-[16rem] flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                <motion.div
                  className="h-full origin-left bg-gradient-to-r from-emerald-400 to-teal-400"
                  style={{ scaleX: progression }}
                />
              </div>
            </div>
            <Link
              to="/signup"
              className="text-xs font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-500 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              There’s a calmer way →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
