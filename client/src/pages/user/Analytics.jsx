import React, { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiPieChart } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTransactions } from '../../store/slices/transactionSlice'

const Analytics = () => {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const { transactions } = useSelector((state) => state.transactions)

  useEffect(() => {
    if (token && transactions.length === 0) {
      dispatch(fetchTransactions(token))
    }
  }, [token, dispatch, transactions.length])

  const categoryData = useMemo(() => {
    const categoryTotals = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
      })
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions])

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.amount, 0)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Analytics</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Visualize your spending patterns</p>
      </motion.div>

      {/* Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
      >
        {categoryData.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-slate-600 dark:text-slate-400">No expense data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Spending by Category
            </h3>
            {categoryData.map((item) => {
              const percentage = ((item.amount / totalExpenses) * 100).toFixed(1)
              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900 dark:text-slate-50">
                      {item.category}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.amount)} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-trackit-accent to-emerald-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>


    </div>
  )
}

export default Analytics
