import React from 'react'
import { motion } from 'framer-motion'
import { FiPieChart } from 'react-icons/fi'

const categories = [
  { name: 'Food & Dining', amount: 850, percentage: 35, color: 'bg-emerald-500' },
  { name: 'Transportation', amount: 420, percentage: 17, color: 'bg-blue-500' },
  { name: 'Entertainment', amount: 320, percentage: 13, color: 'bg-purple-500' },
  { name: 'Shopping', amount: 580, percentage: 24, color: 'bg-pink-500' },
  { name: 'Bills & Utilities', amount: 270, percentage: 11, color: 'bg-orange-500' },
]

const Analytics = () => {
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
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <FiPieChart className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">Chart visualization coming soon</p>
          </div>
        </div>
      </motion.div>

      {/* Spending Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
      >
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Spending by Category</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">This month's breakdown</p>
        
        <div className="mt-6 space-y-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 dark:text-slate-50">{category.name}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  ${category.amount} ({category.percentage}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  className={`h-full ${category.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Analytics
