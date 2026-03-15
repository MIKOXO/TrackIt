import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransactions } from '../../store/slices/transactionSlice'
import SkeletonLoader from '../../components/ui/SkeletonLoader'
import { formatCurrency } from '../../utils/currencyUtils.js'

const Overview = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const token = useSelector((state) => state.auth.token)
  const currency = useSelector((state) => state.auth.user?.currency ?? 'ETB')
  const { transactions, loading } = useSelector((state) => state.transactions)

  useEffect(() => {
    if (token && transactions.length === 0) {
      dispatch(fetchTransactions(token))
    }
  }, [token, dispatch, transactions.length])

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

  const stats = [
    { 
      icon: FiDollarSign, 
      label: 'Total Balance', 
      value: formatMoney(totalBalance), 
      change: '', 
      trend: 'up' 
    },
    { 
      icon: FiCreditCard, 
      label: 'This Month', 
      value: formatMoney(thisMonthTotal), 
      change: '', 
      trend: thisMonthTotal >= 0 ? 'up' : 'down' 
    },
    { 
      icon: FiTrendingUp, 
      label: 'Income', 
      value: formatMoney(totalIncome), 
      change: '', 
      trend: 'up' 
    },
    { 
      icon: FiTrendingDown, 
      label: 'Expenses', 
      value: formatMoney(totalExpenses), 
      change: '', 
      trend: 'down' 
    },
  ]

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Here's what's happening with your finances today
        </p>
      </motion.div>

      {/* Content */}
      {loading && transactions.length === 0 ? (
        <SkeletonLoader cardCount={4} gridCols="lg:grid-cols-4" showCharts={true} chartCount={1} />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <stat.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Recent Activity</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Your latest transactions</p>
            
            {recentTransactions.length === 0 ? (
              <div className="mt-6 text-center text-slate-600 dark:text-slate-400">
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/60"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {transaction.category}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatMoney(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Overview
