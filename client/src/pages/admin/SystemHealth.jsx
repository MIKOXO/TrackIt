import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiActivity, FiAlertTriangle, FiDatabase, FiRefreshCw, FiServer } from 'react-icons/fi'

const sectionVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const buildSeries = (base, jitter) => []

const SERIES = {
  '1h': {
    volume: buildSeries(1200, 140),
    latency: buildSeries(180, 35),
    errors: buildSeries(1.2, 0.6),
  },
  '24h': {
    volume: buildSeries(980, 260),
    latency: buildSeries(210, 55),
    errors: buildSeries(1.6, 0.8),
  },
  '7d': {
    volume: buildSeries(760, 320),
    latency: buildSeries(240, 65),
    errors: buildSeries(1.9, 0.9),
  },
}

const toPath = (values, { width, height, padding = 6 }) => {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1e-6, max - min)
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * innerW
    const y = padding + (1 - (value - min) / span) * innerH
    return [x, y]
  })

  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
}

const MiniLineChart = ({ values, accent = 'emerald' }) => {
  const width = 220
  const height = 64
  const path = useMemo(() => toPath(values, { width, height }), [values])
  const stroke =
    accent === 'rose'
      ? 'stroke-rose-500'
      : accent === 'amber'
        ? 'stroke-amber-500'
        : 'stroke-emerald-500'

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
      <path d={path} fill="none" className={`${stroke} opacity-90`} strokeWidth="2.5" strokeLinecap="round" />
      <path d={path} fill="none" className={`${stroke} opacity-25`} strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}

const StatCard = ({ label, value, note, icon: Icon }) => (
  <motion.article
    className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
    variants={sectionVariant}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{label}</p>
      <Icon className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
    </div>
    <p className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400">{note}</p>
  </motion.article>
)

const SystemHealth = () => {
  const [range, setRange] = useState('24h')
  const series = SERIES[range]

  const summary = useMemo(() => {
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length)
    const p95 = (arr) => {
      const sorted = [...arr].sort((a, b) => a - b)
      return sorted[Math.floor(sorted.length * 0.95)]
    }
    return {
      volumeAvg: Math.round(avg(series.volume)),
      latencyP95: Math.round(p95(series.latency)),
      errorsAvg: avg(series.errors).toFixed(2),
    }
  }, [series])

  const dependencies = []

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
    >
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">System health</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Live telemetry (mock)</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track request volume, latency, and error rate over time ranges.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-trackit-border dark:bg-slate-950">
          {[
            { id: '1h', label: '1h' },
            { id: '24h', label: '24h' },
            { id: '7d', label: '7d' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRange(item.id)}
              className={[
                'rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition',
                range === item.id
                  ? 'bg-emerald-600 text-white shadow shadow-emerald-600/20'
                  : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900/40',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Avg throughput"
          value={`${summary.volumeAvg.toLocaleString()}/min`}
          note={`Range: last ${range}`}
          icon={FiActivity}
        />
        <StatCard label="p95 latency" value={`${summary.latencyP95} ms`} note="API response time" icon={FiServer} />
        <StatCard label="Avg error rate" value={`${summary.errorsAvg}%`} note="5xx + auth failures" icon={FiAlertTriangle} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: 'Request volume',
            subtitle: 'Requests per minute',
            values: series.volume,
            accent: 'emerald',
          },
          {
            title: 'Latency trend',
            subtitle: 'p50–p95 drift indicator',
            values: series.latency,
            accent: 'amber',
          },
          {
            title: 'Error rate',
            subtitle: 'Percent failures',
            values: series.errors,
            accent: 'rose',
          },
        ].map((panel) => (
          <motion.article
            key={panel.title}
            className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
            variants={sectionVariant}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{panel.title}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{panel.subtitle}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{range}</span>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-trackit-border dark:bg-slate-950">
              <MiniLineChart values={panel.values} accent={panel.accent} />
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Mock chart · wired to backend metrics later.
            </p>
          </motion.article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Dependencies</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Service posture</h3>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Live</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dependencies.map((dep) => (
            <motion.article
              key={dep.name}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-950"
              variants={sectionVariant}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <dep.icon className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{dep.name}</p>
                </div>
                <span
                  className={[
                    'rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em]',
                    dep.status === 'Healthy'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
                  ].join(' ')}
                >
                  {dep.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{dep.detail}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </motion.div>
  )
}

export default SystemHealth
