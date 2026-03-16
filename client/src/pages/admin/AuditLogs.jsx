import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiFilter, FiSearch, FiShield, FiUser } from 'react-icons/fi'
import { useToast } from '../../components/ui/ToastProvider.jsx'

const MOCK_LOGS = []

const sectionVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const formatDateTime = (value) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const badgeBase =
  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em]'

const severityBadge = (severity) => {
  if (severity === 'high')
    return `${badgeBase} border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200`
  if (severity === 'medium')
    return `${badgeBase} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200`
  return `${badgeBase} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200`
}

const AuditLogs = () => {
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('all')
  const [action, setAction] = useState('all')

  const actions = useMemo(() => {
    const set = new Set(MOCK_LOGS.map((log) => log.action))
    return Array.from(set).sort()
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return MOCK_LOGS.filter((log) => {
      if (severity !== 'all' && log.severity !== severity) return false
      if (action !== 'all' && log.action !== action) return false
      if (!normalized) return true
      const haystack = [
        log.id,
        log.action,
        log.actor?.name,
        log.actor?.role,
        log.target?.label,
        log.target?.id,
        log.ip,
        log.detail,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [query, severity, action])

  const handleExport = () => {
    showToast('Export started (mock). Wire to CSV endpoint later.', { type: 'success' })
  }

  const handleReset = () => {
    setQuery('')
    setSeverity('all')
    setAction('all')
    showToast('Filters cleared.', { type: 'success' })
  }

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
    >
      <motion.section
        className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
        variants={sectionVariant}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Audit logs</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Admin and auth activity (mock)</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Track who did what, when, and from where. Use this for investigations and compliance.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-trackit-border dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/40"
            >
              <FiFilter className="h-4 w-4" />
              Reset filters
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-trackit-accent to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/35 transition hover:shadow-xl"
            >
              <FiDownload className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px_260px]">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actor, action, target, IP..."
              className="w-full rounded-xl border border-slate-200/60 bg-white py-3 pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-950 dark:text-slate-50"
            />
          </div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </motion.section>

      <motion.section
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-950"
        variants={sectionVariant}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-trackit-border">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Actor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Target
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  IP
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-trackit-border dark:bg-slate-950">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-600 dark:text-slate-400">
                    No audit entries match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                    <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">{formatDateTime(log.timestamp)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                          {log.actor?.role === 'admin' ? <FiShield className="h-5 w-5" /> : <FiUser className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{log.actor?.name ?? '—'}</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{log.actor?.role ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{log.action}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{log.id}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{log.target?.label ?? '—'}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{log.target?.id ?? '—'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={severityBadge(log.severity)}>{log.severity}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">{log.ip}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">{log.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </motion.div>
  )
}

export default AuditLogs

