import React, { useEffect, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { SPRING, stagger, springUp, useTilt } from './motionPresets.js'

const headlineWords = [
  { text: 'See' },
  { text: 'where' },
  { text: 'your' },
  { text: 'money' },
  { text: 'actually', glow: true },
  { text: 'goes.', glow: true },
]

const bars = [42, 68, 52, 88, 60, 96, 74, 38]
const peakIndex = bars.indexOf(Math.max(...bars))

const spendSplit = [
  { label: 'Essentials', value: 62, width: '62%', tone: 'from-emerald-400 to-emerald-500' },
  { label: 'Wants', value: 24, width: '24%', tone: 'from-teal-400 to-teal-500' },
  { label: 'Savings', value: 14, width: '14%', tone: 'from-sky-400 to-sky-500' },
]

const chatFeed = [
  { q: '“Where did my money go?”', a: 'Food and transport led the way — up 18% this month.' },
  { q: '“Can I safely save more?”', a: 'Yes. You kept ETB 1,440 last month — 14% of income.' },
  { q: '“Anything to watch out for?”', a: 'Late-night orders. Small extras, five this week.' },
]

const wordReveal = {
  hidden: { opacity: 0, y: '0.6em', scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING.snappy },
}

const headlineVariant = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { ...SPRING.soft, staggerChildren: 0.05, delayChildren: 0.06 } },
}

const HeroSection = () => {
  const [chatIndex, setChatIndex] = useState(0)

  const balance = useMotionValue(0)
  const balanceText = useTransform(balance, (value) => Math.round(value).toLocaleString('en-US'))

  const { scrollY } = useScroll()
  const textDrift = useSpring(useTransform(scrollY, [0, 600], [0, 42]), { stiffness: 70, damping: 20 })
  const artDrift = useSpring(useTransform(scrollY, [0, 600], [0, -55]), { stiffness: 70, damping: 20 })
  const chipDrift = useSpring(useTransform(scrollY, [0, 600], [0, -95]), { stiffness: 70, damping: 20 })
  const pillDrift = useSpring(useTransform(scrollY, [0, 600], [0, -20]), { stiffness: 70, damping: 20 })

  const tilt = useTilt(7)

  useEffect(() => {
    const controls = animate(balance, 12480, { ...SPRING.soft, delay: 0.9, restDelta: 1 })
    return () => controls.stop()
  }, [balance])

  useEffect(() => {
    const id = window.setInterval(() => setChatIndex((prev) => (prev + 1) % chatFeed.length), 4600)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="relative overflow-hidden bg-white text-slate-900 dark:bg-trackit-background dark:text-slate-50">
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-44 left-[10%] h-[30rem] w-[30rem] rounded-full bg-emerald-300/40 blur-[120px] dark:bg-emerald-500/20"
      />
      <motion.div
        animate={{ x: [0, -30, 15, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute right-[4%] top-24 h-[24rem] w-[24rem] rounded-full bg-sky-200/50 blur-[110px] dark:bg-sky-500/10"
      />

      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_28%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_75%_65%_at_50%_28%,black,transparent)] dark:[background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]" />

      <div className="mx-auto grid max-w-6xl gap-16 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-28 lg:pt-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.09, 0.1)}
          style={{ y: textDrift }}
          className="relative z-10 max-w-xl"
        >
          <motion.h1
            variants={headlineVariant}
            className="text-4xl font-semibold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-50"
          >
            {headlineWords.map((word, index) => (
              <React.Fragment key={index}>
                <motion.span
                  variants={wordReveal}
                  className={`inline-block ${word.glow ? 'pb-[0.35em] -mb-[0.35em] bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent' : ''}`}
                >
                  {word.text}
                </motion.span>
                {' '}
              </React.Fragment>
            ))}
          </motion.h1>

          <motion.p variants={springUp()} className="mt-6 max-w-md text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-300">
            Every dollar logged and explained, in plain language. No spreadsheets required.
          </motion.p>

          <motion.div variants={springUp()} className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/signup"
              className="relative inline-flex items-center justify-center rounded-full bg-trackit-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(2,6,23,0.08),0_5px_12px_-5px_rgba(34,197,94,0.38)] transition duration-200 ease-out hover:shadow-[0_4px_10px_-2px_rgba(34,197,94,0.32)] active:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-trackit-accent/25"
            >
              Start tracking free
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, rotate: -3, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ ...SPRING.soft, delay: 0.25 }}
          style={{ y: artDrift }}
          className="relative z-10 mx-auto w-full max-w-md lg:max-w-lg"
        >
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.75rem] bg-gradient-to-br from-emerald-400/25 via-teal-400/10 to-sky-400/20 blur-3xl dark:from-emerald-500/25 dark:via-teal-500/10 dark:to-sky-500/15" />

          <motion.div
            {...tilt}
            className="relative rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 pb-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] backdrop-blur sm:p-6 dark:border-trackit-border/70 dark:bg-slate-900/70 dark:shadow-[0_30px_90px_-30px_rgba(2,6,23,0.9)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  This month
                </span>
              </div>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING.snappy, delay: 1.1 }}
                className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[0.68rem] font-semibold text-emerald-600 dark:text-emerald-300"
              >
                −12% spending vs Oct
              </motion.span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING.soft, delay: 0.8 }}
              className="mt-5"
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">You&apos;ve spent</p>
              <p className="mt-1 flex items-baseline gap-1.5 text-4xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-slate-50">
                <span className="text-2xl text-slate-500 dark:text-slate-400">ETB</span>
                <motion.span>{balanceText}</motion.span>
              </p>
            </motion.div>

            <div className="relative mt-6 h-28">
              <div className="absolute inset-x-0 top-0 h-px bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="absolute inset-x-0 bottom-px flex h-[calc(100%-2px)] items-end justify-between gap-1.5 sm:gap-2">
                {bars.map((height, index) => (
                  <motion.span
                    key={index}
                    style={{ height: `${height}%`, transformOrigin: 'bottom' }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ ...SPRING.bouncy, delay: 0.65 + index * 0.06 }}
                    className={`w-full rounded-md sm:rounded-lg ${
                      index === peakIndex
                        ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.45)]'
                        : 'bg-gradient-to-t from-emerald-400/25 to-emerald-300/25 dark:from-emerald-500/25 dark:to-emerald-400/35'
                    }`}
                  />
                ))}
              </div>
              <motion.span
                initial={{ opacity: 0, x: '-50%', y: 12, scale: 0.5 }}
                animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
                transition={{ ...SPRING.bouncy, delay: 0.65 + bars.length * 0.06 + 0.3 }}
                style={{ left: `${((peakIndex + 0.5) / bars.length) * 100}%` }}
                className="absolute -top-1 z-10 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[0.62rem] font-semibold tabular-nums text-emerald-600 backdrop-blur dark:text-emerald-300"
              >
                ETB 2,480
              </motion.span>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200/70 pt-5 dark:border-slate-800/80">
              {spendSplit.map((row) => (
                <div key={row.label} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                  <span className="font-medium text-slate-500 dark:text-slate-400">{row.label}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: row.width }}
                      transition={{ ...SPRING.soft, delay: 1.2 }}
                      className={`h-full rounded-full bg-gradient-to-r ${row.tone}`}
                    />
                  </div>
                  <span className="text-right tabular-nums text-slate-400 dark:text-slate-500">{row.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div style={{ y: pillDrift }} className="absolute -left-3 -top-6 z-20 sm:-left-6">
            <motion.div
              animate={{ y: [0, 7, 0], rotate: [0, 1.5, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-white/90 px-3 py-1.5 text-[0.7rem] font-semibold text-slate-700 shadow-lg shadow-emerald-500/10 backdrop-blur dark:border-emerald-400/30 dark:bg-slate-900/90 dark:text-emerald-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              +ETB 1,440 kept · 14%
            </motion.div>
          </motion.div>

          <motion.div style={{ y: chipDrift }} className="absolute -bottom-10 right-0 z-20 hidden w-[15.5rem] sm:block lg:-right-8 lg:w-[17rem]">
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur dark:border-trackit-border/80 dark:bg-slate-900/85 dark:shadow-black/40"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
                  TrackIt assistant
                </span>
              </div>
              <div className="relative mt-3 min-h-[5.4rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={chatIndex}
                    initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: SPRING.snappy }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(6px)', transition: { duration: 0.25 } }}
                    className="absolute inset-0"
                  >
                    <p className="text-[0.74rem] font-semibold text-slate-800 dark:text-emerald-100">
                      {chatFeed[chatIndex].q}
                    </p>
                    <p className="mt-1.5 text-[0.74rem] leading-5 text-slate-500 dark:text-slate-400">
                      {chatFeed[chatIndex].a}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
