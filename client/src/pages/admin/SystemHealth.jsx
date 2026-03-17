import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiActivity, FiDatabase, FiRefreshCw, FiServer, FiShield, FiUsers, FiZap } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../../store/slices/adminSlice.js'
import SkeletonLoader from '../../components/ui/SkeletonLoader.jsx'

const sectionVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const RANGE_LABELS = {
  '1h': 'Last hour',
  '24h': 'Last 24 hours',
  '7d': 'Last week',
}

const THROUGHPUT_SUFFIX = {
  '1h': 'min',
  '24h': 'hr',
  '7d': 'day',
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const DEPENDENCY_ICONS = {
  MongoDB: FiDatabase,
  'Auth middleware': FiShield,
  'Background jobs': FiZap,
}

const toPath = (values, { width, height, padding = 6 }) => {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1e-6, max - min)
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const divisor = Math.max(values.length - 1, 1)

  const points = values.map((value, index) => {
    const x = padding + (index / divisor) * innerW
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
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { dashboard } = useSelector((state) => state.admin)
  const { data: dashboardData, loading, error } = dashboard
  const [range, setRange] = useState('24h')
  const [cachedData, setCachedData] = useState(null)

  useEffect(() => {
    if (token) {
      dispatch(fetchDashboardStats({ token }))
    }
  }, [dispatch, token])

  useEffect(() => {
    if (dashboardData) {
      setCachedData(dashboardData)
    }
  }, [dashboardData])

  const dataToShow = cachedData || dashboardData
  const systemHealth = dataToShow?.systemHealth
  const rangeData = systemHealth?.ranges?.[range]

  const summary = useMemo(() => ({
    throughputAvg: rangeData?.summary?.throughputAvg ?? 0,
    avgAmount: rangeData?.summary?.avgAmount ?? 0,
    uniqueUsers: rangeData?.summary?.uniqueUsers ?? 0,
    totalTransactions: rangeData?.summary?.totalTransactions ?? 0,
  }), [rangeData])

  const isInitialLoading = loading && !dataToShow
  const isErrored = error && !dataToShow

  if (isInitialLoading) {
    return (
      <SkeletonLoader cardCount={3} gridCols="md:grid-cols-3" showCharts chartCount={3} cardHeight="h-40" />
    )
  }

  if (isErrored) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-500/30 dark:bg-rose-500/10">
        <p className="text-rose-700 dark:text-rose-200">Error loading system telemetry: {error}</p>
        <button
          onClick={() => dispatch(fetchDashboardStats({ token }))}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
        >
          Retry
        </button>
      </div>
    )
  }

  const chartPanels = [
    {
      title: 'Transactions',
      subtitle: 'Interval count',
      values: rangeData?.series?.throughput ?? [],
      accent: 'emerald',
      footer: `${summary.totalTransactions.toLocaleString()} transactions ${RANGE_LABELS[range]?.toLowerCase()}`,
    },
    {
      title: 'Average size',
      subtitle: 'USD per transaction',
      values: rangeData?.series?.avgAmount ?? [],
      accent: 'amber',
      footer: `${CURRENCY_FORMATTER.format(summary.avgAmount)} average`,
    },
    {
      title: 'Unique users',
      subtitle: 'Users per interval',
      values: rangeData?.series?.uniqueUsers ?? [],
      accent: 'rose',
      footer: `${summary.uniqueUsers.toLocaleString()} unique users ${RANGE_LABELS[range]?.toLowerCase()}`,
    },
  ]

  const dependencies = systemHealth?.dependencies ?? []
  const lastUpdatedRaw = systemHealth?.lastUpdated || dataToShow?.metadata?.lastUpdated
  const lastUpdatedDate = lastUpdatedRaw ? new Date(lastUpdatedRaw) : null
  const lastUpdatedLabel =
    lastUpdatedDate && !Number.isNaN(lastUpdatedDate.getTime())
      ? lastUpdatedDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      : 'not available'

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
    >
      {error && dataToShow && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm shadow-black/5 dark:border-rose-500/30 dark:bg-rose-500/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>Error refreshing data: {error}</p>
            <button
              type="button"
              onClick={() => dispatch(fetchDashboardStats({ token }))}
              className="rounded-xl border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">System health</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Live telemetry</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Tracking throughput, average size, and user activity from persisted transactions. Showing {RANGE_LABELS[range]?.toLowerCase()}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-trackit-border dark:bg-slate-950">
            {['1h', '24h', '7d'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={[
                  'rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition',
                  range === item
                    ? 'bg-emerald-600 text-white shadow shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900/40',
                ].join(' ')}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchDashboardStats({ token }))}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-sm shadow-black/5 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-wait disabled:opacity-60 dark:border-trackit-border dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-slate-600"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Avg throughput"
          value={`${summary.throughputAvg.toLocaleString()}/${THROUGHPUT_SUFFIX[range]}`}
          note={`Range: ${RANGE_LABELS[range]}`}
          icon={FiActivity}
        />
        <StatCard
          label="Avg transaction size"
          value={CURRENCY_FORMATTER.format(summary.avgAmount)}
          note="Range average"
          icon={FiServer}
        />
        <StatCard
          label="Unique users"
          value={summary.uniqueUsers.toLocaleString()}
          note={`Range: ${RANGE_LABELS[range]}`}
          icon={FiUsers}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {chartPanels.map((panel) => (
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
              {panel.footer}
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
          <div className="flex items-center gap-2">
            {loading && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Live</span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dependencies.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Dependency status is initializing.</p>
          )}
          {dependencies.map((dep) => {
            const Icon = DEPENDENCY_ICONS[dep.name] || FiServer
            return (
              <motion.article
                key={dep.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-950"
                variants={sectionVariant}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
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
            )
          })}
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Last updated: {lastUpdatedLabel}</p>
      </section>
    </motion.div>
  )
}

export default SystemHealth
