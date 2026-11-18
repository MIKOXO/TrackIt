import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAnalytics } from '../../store/slices/analyticsSlice'
import { AnalyticsCharts } from '../../components/user/AnalyticsCharts'
import SkeletonLoader from '../../components/ui/SkeletonLoader'
import DropdownSelect from '../../components/ui/DropdownSelect'
import { formatCurrency } from '../../utils/currencyUtils.js'

const Analytics = () => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const isDark = useSelector((state) => state.theme.mode === 'dark')
  const currency = useSelector((state) => state.auth.user?.currency ?? 'ETB')
  const { data, loading, error } = useSelector((state) => state.analytics)
  const [months, setMonths] = useState(6)
  const [days] = useState(14)

  useEffect(() => {
    if (!isAuthenticated) return
    dispatch(fetchAnalytics({ months, days }))
  }, [dispatch, isAuthenticated, months, days])

  const formatMoney = (value) => formatCurrency(value, currency)

  const rangeOptions = [
    { label: '1 month', value: 1 },
    { label: '3 months', value: 3 },
    { label: '6 months', value: 6 },
    { label: '9 months', value: 9 },
    { label: '12 months', value: 12 },
    { label: '18 months', value: 18 },
    { label: '24 months', value: 24 },
  ]

  const summaryCards = [
    {
      label: 'Income',
      value: formatMoney(data?.totals?.income),
      caption: 'Total in range',
      valueClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Expenses',
      value: formatMoney(data?.totals?.expense),
      caption: 'Total in range',
      valueClass: 'text-rose-600 dark:text-rose-400',
    },
    {
      label: 'Net',
      value: `${(data?.totals?.net ?? 0) >= 0 ? '+' : '−'}${formatMoney(Math.abs(data?.totals?.net ?? 0))}`,
      caption: 'Income minus expenses',
      valueClass: (data?.totals?.net ?? 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50',
    },
    {
      label: 'Range',
      value: `${months} months`,
      caption: 'Selected window',
      valueClass: 'text-slate-900 dark:text-slate-50',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white px-5 py-4 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
      >
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-600/90 dark:text-emerald-300/90">
            Analytics
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Analytics</h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Trends and breakdowns, powered by your saved transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Range</span>
          <div className="w-40">
            <DropdownSelect
              value={months}
              options={rangeOptions}
              onChange={(next) => setMonths(Number(next))}
              ariaLabel="Analytics range"
            />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-200/60 bg-rose-50 p-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {error}
        </motion.div>
      ) : loading && !data ? (
        <SkeletonLoader cardCount={4} gridCols="lg:grid-cols-4" showCharts={true} chartCount={3} />
      ) : (
        <>
          {/* Summary */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {summaryCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-slate-200/60 bg-white px-4 py-4 shadow-sm sm:px-5 dark:border-trackit-border/60 dark:bg-slate-900/30"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className={`mt-1.5 text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl ${card.valueClass}`}>
                  {card.value}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-slate-400 dark:text-slate-500">
                  {card.caption}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <AnalyticsCharts analytics={data} isDark={isDark} currency={currency} />
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Analytics
