import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiShield, FiActivity, FiUsers, FiZap } from 'react-icons/fi'
import { useSelector, useDispatch } from 'react-redux'
import { fetchDashboardStats } from '../../store/slices/adminSlice.js'
import SkeletonLoader from '../../components/ui/SkeletonLoader.jsx'

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { dashboard } = useSelector((state) => state.admin)
  const { data: dashboardData, loading, error } = dashboard
  
  // Local state to track if we have any data to show
  const [localData, setLocalData] = useState(null)

  useEffect(() => {
    if (token) {
      dispatch(fetchDashboardStats({ token }))
    }
  }, [dispatch, token])

  // Update local data when new data arrives
  useEffect(() => {
    if (dashboardData) {
      setLocalData(dashboardData)
    }
  }, [dashboardData])

  // Smart loading logic - only show skeleton on initial load with no cached data
  const isInitialLoading = loading && !localData

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <SkeletonLoader 
          cardCount={4} 
          gridCols="md:grid-cols-2 xl:grid-cols-4"
          showCharts={false}
        />
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Activity</p>
              <div className="mt-2 h-6 w-48 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-4 w-12 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={`activity-skeleton-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-trackit-border dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                    <div className="mt-2 h-3 w-24 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                  </div>
                  <div className="h-3 w-16 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="mt-3 h-3 w-40 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !localData) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-500/30 dark:bg-rose-500/10">
        <p className="text-rose-700 dark:text-rose-200">Error: {error}</p>
        <button
          onClick={() => dispatch(fetchDashboardStats({ token }))}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
        >
          Retry
        </button>
      </div>
    )
  }

  // Use cached data if available, otherwise show default empty state
  const dataToDisplay = localData || dashboardData
  const insights = dataToDisplay ? [
    {
      icon: FiActivity,
      label: 'Total transactions',
      value: dataToDisplay.insights.totalTransactions.toLocaleString(),
      detail: dataToDisplay.insights.totalTransactions > 0 
        ? 'processed across all users' 
        : 'no transactions processed yet',
    },
    {
      icon: FiUsers,
      label: 'Active users',
      value: dataToDisplay.insights.activeUsers.toString(),
      detail: dataToDisplay.insights.activeUsers > 0
        ? 'users with activity in the last 7 days'
        : 'no active users',
    },
    {
      icon: FiZap,
      label: 'System uptime',
      value: dataToDisplay.insights.systemUptime,
      detail: dataToDisplay.insights.systemUptime !== '0%'
        ? 'consistent performance and reliability'
        : 'system status unknown',
    },
    {
      icon: FiShield,
      label: 'Data integrity',
      value: dataToDisplay.insights.dataIntegrity,
      detail: dataToDisplay.insights.dataIntegrity !== '0%'
        ? 'all transactions verified and secure'
        : 'no data to verify',
    },
  ] : [
    {
      icon: FiActivity,
      label: 'Total transactions',
      value: '0',
      detail: 'no transactions processed yet',
    },
    {
      icon: FiUsers,
      label: 'Active users',
      value: '0',
      detail: 'no active users',
    },
    {
      icon: FiZap,
      label: 'System uptime',
      value: '0%',
      detail: 'system status unknown',
    },
    {
      icon: FiShield,
      label: 'Data integrity',
      value: '0%',
      detail: 'no data to verify',
    },
  ]

  const activities = dataToDisplay?.recentActivities || []

  return (
    <>
      <motion.div className="space-y-8" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.09 } } }}>
        {/* Show inline error if there's an error but we have cached data */}
        {error && localData && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm shadow-black/5 dark:border-rose-500/30 dark:bg-rose-500/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>Error refreshing data: {error}</p>
              <button
                type="button"
                onClick={() => dispatch(fetchDashboardStats({ token }))}
                className="rounded-xl border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {insights.map((insight) => (
            <motion.article
              key={insight.label}
              className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
              variants={cardVariant}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{insight.label}</p>
                <insight.icon className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-50">{insight.value}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{insight.detail}</p>
            </motion.article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Activity</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Recent user activity</h2>
            </div>
            <div className="flex items-center gap-2">
              {loading && (
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <span className="text-xs tracking-[0.3em] text-slate-500 dark:text-slate-400">Live</span>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {activities.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-trackit-border dark:bg-slate-900/40">
                <p className="text-slate-600 dark:text-slate-400">No recent activity to display</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <motion.article
                  key={`${activity.user}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/40"
                  variants={cardVariant}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{activity.user}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{activity.action}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{activity.timestamp}</span>
                  </div>
                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    {activity.detail}
                  </div>
                </motion.article>
              ))
            )}
          </div>
        </section>
      </motion.div>
    </>
  )
}

export default AdminDashboard
