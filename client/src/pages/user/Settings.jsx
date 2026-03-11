import React from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiBell, FiLock, FiGlobe } from 'react-icons/fi'
import { useSelector } from 'react-redux'

const Settings = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your account preferences</p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiUser className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Profile Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name}
                className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
              />
            </div>
            <button className="rounded-xl bg-gradient-to-r from-trackit-accent to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:shadow-xl">
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiBell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            {['Email notifications', 'Push notifications', 'Budget alerts'].map((item) => (
              <label key={item} className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-900 dark:text-slate-50">{item}</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 dark:border-slate-600"
                />
              </label>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiLock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Security</h2>
          </div>
          
          <button className="rounded-xl border border-slate-200/60 bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:hover:bg-slate-800/50">
            Change Password
          </button>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiGlobe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency</label>
              <select className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Language</label>
              <select className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings
