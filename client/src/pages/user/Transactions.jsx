import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter } from 'react-icons/fi'

const transactions = [
  { id: 1, name: 'Grocery Store', category: 'Food', amount: -85.5, date: '2024-01-15', type: 'expense' },
  { id: 2, name: 'Salary Deposit', category: 'Income', amount: 5200.0, date: '2024-01-14', type: 'income' },
  { id: 3, name: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, date: '2024-01-13', type: 'expense' },
  { id: 4, name: 'Gas Station', category: 'Transport', amount: -45.0, date: '2024-01-12', type: 'expense' },
  { id: 5, name: 'Restaurant', category: 'Food', amount: -67.8, date: '2024-01-11', type: 'expense' },
]

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
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center justify-between p-6 transition hover:bg-slate-50 dark:hover:bg-slate-800/30"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                  }`}
                >
                  <span
                    className={`text-lg font-bold ${
                      transaction.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{transaction.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {transaction.category} • {transaction.date}
                  </p>
                </div>
              </div>
              <span
                className={`text-lg font-bold ${
                  transaction.type === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-900 dark:text-slate-50'
                }`}
              >
                {transaction.type === 'income' ? '+' : ''}
                {transaction.amount.toFixed(2)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Transactions
