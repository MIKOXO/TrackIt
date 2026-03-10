import React from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiBarChart2, FiMessageCircle } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-white/70 to-slate-100 text-slate-900 dark:from-slate-900 dark:via-trackit-background dark:to-slate-950 dark:text-slate-50">
      <div className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center opacity-40 blur-3xl">
        <div className="h-64 w-[40rem] bg-emerald-500/40" />
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col gap-12 px-4 pb-16 pt-10 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-xl space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 shadow-sm shadow-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-300">
            <HiOutlineSparkles className="h-4 w-4" />
            AI-powered personal finance, built for you
          </span>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-50">
            See where your money
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              {' '}
              actually goes.
            </span>
          </h1>

          <p className="max-w-lg text-sm text-slate-600 dark:text-slate-300">
            TrackIt turns raw transactions into clear stories. Log expenses, monitor budgets,
            and chat with an AI that explains your habits in plain language — no spreadsheets
            required.
          </p>

          <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-trackit-accent to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Start tracking free
            <FiArrowRight className="h-4 w-4" />
          </Link>
          </div>

          <dl className="mt-6 grid max-w-md grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-300 sm:text-sm">
            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/90 px-4 py-3 shadow-sm shadow-black/5 dark:border-emerald-500/40 dark:bg-slate-900/60">
              <dt className="text-[0.7rem] uppercase tracking-wide text-trackit-muted dark:text-emerald-300">
                Built for real life
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Students, freelancers, and young pros
              </dd>
            </div>
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 shadow-sm shadow-emerald-500/30">
              <dt className="text-[0.7rem] uppercase tracking-wide text-emerald-300">
                AI insights
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                Ask "why" — not just "how much"
              </dd>
            </div>
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 flex flex-1 justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute -inset-8 rounded-[2.75rem] bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 translate-x-6 translate-y-6 rounded-[2.5rem] bg-slate-950/10 blur-2xl dark:bg-emerald-500/10" />

            <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/50 bg-white/80 p-4 shadow-2xl shadow-black/10 backdrop-blur dark:border-trackit-border/60 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-900/75 dark:to-slate-950/90 dark:shadow-black/60">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.14),_transparent_24%)]" />

              <div className="relative space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/85 px-3 py-2 text-slate-900 shadow-sm shadow-black/5 dark:border-trackit-border/60 dark:bg-slate-900/85 dark:text-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-400/40 dark:text-emerald-300">
                      <FiBarChart2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Monthly overview
                      </span>
                      <span className="text-[0.7rem] text-trackit-muted dark:text-slate-500">
                        Income vs expenses
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[0.7rem] font-semibold text-emerald-600 shadow-sm shadow-emerald-500/20 dark:text-emerald-300">
                    +28% clarity
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/75 p-3 text-slate-900 shadow-sm shadow-black/5 dark:border-trackit-border/70 dark:bg-slate-950/65 dark:text-slate-50">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-emerald-500/10 to-transparent" />
                    <p className="relative text-[0.7rem] text-trackit-muted dark:text-slate-400">
                      This month&apos;s flow
                    </p>
                    <div className="relative mt-3 space-y-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total spent</p>
                      <p className="flex items-baseline gap-1 text-lg font-semibold">
                        $1,248
                        <span className="text-[0.65rem] font-medium text-emerald-500 dark:text-emerald-300">
                          -12% vs last month
                        </span>
                      </p>
                    </div>
                    <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_0_18px_rgba(16,185,129,0.45)]" />
                    </div>
                    <div className="relative mt-4 h-16">
                      <div className="absolute inset-x-0 top-3 h-px bg-slate-200 dark:bg-slate-800" />
                      <div className="absolute inset-x-0 top-8 h-px bg-slate-200/70 dark:bg-slate-800/80" />
                      <div className="absolute inset-x-0 top-[0.55rem] flex items-end justify-between">
                        <span className="h-6 w-6 rounded-t-full bg-emerald-400/20" />
                        <span className="h-10 w-6 rounded-t-full bg-emerald-400/30" />
                        <span className="h-8 w-6 rounded-t-full bg-emerald-500/40" />
                        <span className="h-12 w-6 rounded-t-full bg-emerald-500/55" />
                        <span className="h-9 w-6 rounded-t-full bg-sky-400/40" />
                      </div>
                    </div>
                    <dl className="relative mt-2 space-y-1 text-[0.7rem] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <dt>Essentials</dt>
                        <dd className="text-emerald-500 dark:text-emerald-300">62%</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>Wants</dt>
                        <dd className="text-slate-500 dark:text-slate-400">24%</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>Savings</dt>
                        <dd className="text-sky-500 dark:text-sky-300">14%</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/80 p-3 shadow-sm shadow-black/5 dark:border-trackit-border/70 dark:bg-slate-950/65">
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-emerald-500/10 to-transparent" />
                    <div className="pointer-events-none absolute -top-10 right-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
                    <div className="relative flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-400/40 dark:text-emerald-300">
                        <FiMessageCircle className="h-3 w-3" />
                      </div>
                      <p className="max-w-[11rem] text-[0.7rem] font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-300">
                        "Where did most of my money go this month?"
                      </p>
                    </div>
                    <div className="relative mt-4 ml-2 border-l border-emerald-400/30 pl-3 text-[0.72rem] leading-5 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-emerald-500 dark:text-emerald-300">Food</span> and{' '}
                      <span className="font-semibold text-emerald-500 dark:text-emerald-300">Transport</span>.
                      Your late-night orders increased by 18%.
                    </div>
                    <div className="relative mt-5 space-y-2">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/75 px-3 py-2 text-[0.68rem] text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                        <span>Food spend</span>
                        <span className="font-semibold text-emerald-500 dark:text-emerald-300">+$84</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-100/85 px-3 py-1.5 text-[0.7rem] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                        <span className="flex-1 truncate">
                          "Give me insights about my spending habits."
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-500 dark:text-emerald-300">
                          Live preview
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/80 px-3 py-3 text-[0.7rem] text-slate-600 shadow-sm shadow-black/5 dark:border-trackit-border/70 dark:bg-slate-950/65 dark:text-slate-300">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      Built for peace of mind
                    </p>
                    <p className="mt-1 text-[0.65rem] text-trackit-muted dark:text-slate-400">
                      Your data stays encrypted and under your control.
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-300">
                    Free while in beta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
