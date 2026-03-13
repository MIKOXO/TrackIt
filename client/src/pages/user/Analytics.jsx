import React from 'react'
import { motion } from 'framer-motion'
import { FiPieChart } from 'react-icons/fi'

const categories = []

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
            <p className="text-slate-600 dark:text-slate-400">No data available</p>
          </div>
      </motion.div>


    </div>
  )
}

export default Analytics
