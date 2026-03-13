import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter } from 'react-icons/fi'

const transactions = []

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Transactions</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Track all your income and expenses</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row"
      >
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200/60 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:hover:bg-slate-800/50">
          <FiFilter className="h-5 w-5" />
          Filter
        </button>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
      >
        <div className="divide-y divide-slate-200/60 dark:divide-trackit-border/60">
          <div className="p-6 text-center text-slate-600 dark:text-slate-400">
            <p>No transactions yet</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Transactions
