import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransactions } from '../../store/slices/transactionSlice'
import SkeletonLoader from '../../components/ui/SkeletonLoader'
import { formatCurrency } from '../../utils/currencyUtils.js'

const Overview = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const currency = useSelector((state) => state.auth.user?.currency ?? 'ETB')
  const { transactions, loading } = useSelector((state) => state.transactions)

  useEffect(() => {
    if (isAuthenticated && transactions.length === 0) {
      dispatch(fetchTransactions())
    }
  }, [isAuthenticated, dispatch, transactions.length])

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = totalIncome - totalExpenses

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const thisMonthTotal = thisMonthTransactions.reduce(
    (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
    0
  )

  const formatMoney = (value) => formatCurrency(value, currency)

  const monthLabel = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const stats = [
    {
      label: 'Total Balance',
      value: formatMoney(totalBalance),
      caption: 'All-time net',
      valueClass: totalBalance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50',
    },
    {
      label: 'This Month',
      value: `${thisMonthTotal >= 0 ? '+' : '−'}${formatMoney(Math.abs(thisMonthTotal))}`,
      caption: 'Net this month',
      valueClass: thisMonthTotal < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Income',
      value: formatMoney(totalIncome),
      caption: 'All-time earned',
      valueClass: 'text-slate-900 dark:text-slate-50',
    },
    {
      label: 'Expenses',
      value: formatMoney(totalExpenses),
      caption: 'All-time spent',
      valueClass: 'text-slate-900 dark:text-slate-50',
    },
  ]

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white px-5 py-4 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
      >
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-600/90 dark:text-emerald-300/90">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Here's what's happening with your finances today
          </p>
        </div>
        <span className="rounded-full border border-slate-200/80 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 dark:border-trackit-border/80 dark:text-slate-400">
          {monthLabel}
        </span>
      </motion.div>

      {/* Content */}
      {loading && transactions.length === 0 ? (
        <SkeletonLoader cardCount={4} gridCols="lg:grid-cols-4" showCharts={true} chartCount={1} />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-slate-200/60 bg-white px-4 py-4 shadow-sm sm:px-5 dark:border-trackit-border/60 dark:bg-slate-900/30"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className={`mt-1.5 text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl ${stat.valueClass}`}>
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-slate-400 dark:text-slate-500">
                  {stat.caption}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">Recent Activity</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Your latest transactions</p>
              </div>
              <Link
                to="/dashboard/transactions"
                className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                View all
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>No transactions yet</p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-slate-200/60 dark:divide-trackit-border/60">
                {recentTransactions.map((transaction) => (
                  <li key={transaction._id} className="flex items-center justify-between gap-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {transaction.category}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] tabular-nums text-slate-400 dark:text-slate-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p
                      className={`flex-shrink-0 text-sm font-bold tabular-nums ${
                        transaction.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '−'}
                      {formatMoney(transaction.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Overview
