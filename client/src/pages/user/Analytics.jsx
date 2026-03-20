import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiPieChart } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAnalytics } from '../../store/slices/analyticsSlice'
import { AnalyticsCharts } from '../../components/user/AnalyticsCharts'
import SkeletonLoader from '../../components/ui/SkeletonLoader'
import DropdownSelect from '../../components/ui/DropdownSelect'
import { formatCurrency } from '../../utils/currencyUtils.js'

const Analytics = () => {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const isDark = useSelector((state) => state.theme.mode === 'dark')
  const currency = useSelector((state) => state.auth.user?.currency ?? 'ETB')
  const { data, loading, error } = useSelector((state) => state.analytics)
  const [months, setMonths] = useState(6)
  const [days] = useState(14)

  useEffect(() => {
    if (token) {
      dispatch(fetchAnalytics({ token, months, days }))
    }
  }, [token, dispatch, months, days])

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
    { label: 'Income', value: formatMoney(data?.totals?.income), accent: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Expenses', value: formatMoney(data?.totals?.expense), accent: 'text-rose-600 dark:text-rose-400' },
    { label: 'Net', value: formatMoney(data?.totals?.net), accent: 'text-slate-900 dark:text-slate-50' },
    { label: 'Range', value: `${months} months`, accent: 'text-slate-900 dark:text-slate-50' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600/90 dark:text-emerald-300/90">
              Analytics
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Analytics</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Trends and breakdowns, powered by your saved transactions
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Range</span>
              <div className="w-44">
                <DropdownSelect
                  value={months}
                  options={rangeOptions}
                  onChange={(next) => setMonths(Number(next))}
                  ariaLabel="Analytics range"
                />
              </div>
            </div>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <FiPieChart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className={`mt-4 text-2xl font-bold ${card.accent}`}>{card.value}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <AnalyticsCharts analytics={data} isDark={isDark} currency={currency} />
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Analytics
