import React from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard } from 'react-icons/fi'
import { useSelector } from 'react-redux'

const stats = [
  { icon: FiDollarSign, label: 'Total Balance', value: '', change: '', trend: 'up' },
  { icon: FiCreditCard, label: 'This Month', value: '', change: '', trend: 'down' },
  { icon: FiTrendingUp, label: 'Income', value: '', change: '', trend: 'up' },
  { icon: FiTrendingDown, label: 'Expenses', value: '', change: '', trend: 'down' },
]

const Overview = () => {
  const { user } = useSelector((state) => state.auth)

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
        
        <div className="mt-6 text-center text-slate-600 dark:text-slate-400">
          <p>No transactions yet</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Overview
