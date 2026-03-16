import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiSearch, FiTrash2, FiSlash, FiCheckCircle, FiShield, FiUser } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../../components/ui/ToastProvider.jsx'
import SkeletonLoader from '../../components/ui/SkeletonLoader.jsx'
import {
  fetchAllUsers,
  fetchUserStats,
  updateUserStatusAsync,
  deleteUserAsync,
} from '../../store/slices/adminSlice.js'

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

const getInitials = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('') || 'U'

const badgeBase = 'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em]'
const skeletonWidths = ['w-28', 'w-16', 'w-16', 'w-16', 'w-16', 'w-24']

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  onCancel,
  onConfirm,
  confirmLoading = false,
}) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-black/20 dark:border-trackit-border dark:bg-slate-950"
          initial={{ y: 12, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 10, opacity: 0, scale: 0.98 }}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-trackit-border dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmLoading}
              className={[
                'rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition',
                danger
                  ? 'bg-rose-600 shadow-rose-600/30 hover:bg-rose-500'
                  : 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500',
                confirmLoading ? 'cursor-wait opacity-70' : '',
              ].join(' ')}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
)

const TableHeader = () => (
  <thead className="bg-slate-50 dark:bg-slate-900/40">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        User
      </th>
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Role
      </th>
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Status
      </th>
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Created
      </th>
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Last active
      </th>
      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Actions
      </th>
    </tr>
  </thead>
)

const formatStatValue = (value) => {
  if (value === undefined || value === null) return '—'
  return typeof value === 'number' ? value.toLocaleString() : value
}

const UserOversight = () => {
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const { token } = useSelector((state) => state.auth)
  const { data: usersData, loading: usersLoading, error: usersError } = useSelector((state) => state.admin.users)
  const { data: userStatsData, loading: statsLoading, error: statsError } = useSelector((state) => state.admin.userStats)

  const [localUsers, setLocalUsers] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [confirm, setConfirm] = useState({ open: false, userId: null, mode: null })
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    if (!token) return
    dispatch(fetchAllUsers({ token }))
    dispatch(fetchUserStats({ token }))
  }, [dispatch, token])

  useEffect(() => {
    if (!usersData) {
      setLocalUsers([])
      return
    }
    setLocalUsers(usersData)
  }, [usersData])

  const localStats = useMemo(() => {
    const active = localUsers.filter((u) => u.status === 'active').length
    const suspended = localUsers.filter((u) => u.status === 'suspended').length
    const admins = localUsers.filter((u) => u.role === 'admin').length
    return { active, suspended, admins, total: localUsers.length }
  }, [localUsers])

  const statsToDisplay = {
    total: userStatsData?.total ?? localStats.total,
    active: userStatsData?.active ?? localStats.active,
    suspended: userStatsData?.suspended ?? localStats.suspended,
    admins: userStatsData?.admins ?? localStats.admins,
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return localUsers
      .filter((user) => {
        if (statusFilter !== 'all' && (user.status || 'active') !== statusFilter) return false
        if (roleFilter !== 'all' && (user.role || 'user') !== roleFilter) return false
        if (!normalized) return true
        const haystack = [user.name, user.email, user.id].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(normalized)
      })
      .sort((a, b) => new Date(b.lastActiveAt || b.createdAt).getTime() - new Date(a.lastActiveAt || a.createdAt).getTime())
  }, [localUsers, query, statusFilter, roleFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, statusFilter, roleFilter])

  const sortedUsers = useMemo(() => {
    const usersCopy = [...filtered]
    usersCopy.sort((a, b) => {
      const aIsAdmin = (a.role || 'user') === 'admin'
      const bIsAdmin = (b.role || 'user') === 'admin'
      if (aIsAdmin && !bIsAdmin) return -1
      if (!aIsAdmin && bIsAdmin) return 1
      const aTime = new Date(a.createdAt || 0).getTime()
      const bTime = new Date(b.createdAt || 0).getTime()
      return aTime - bTime
    })
    return usersCopy
  }, [filtered])

  const USERS_PER_PAGE = 10
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE
    return sortedUsers.slice(start, start + USERS_PER_PAGE)
  }, [sortedUsers, currentPage])

  const pageStart = sortedUsers.length === 0 ? 0 : (currentPage - 1) * USERS_PER_PAGE + 1
  const pageEnd = Math.min(currentPage * USERS_PER_PAGE, sortedUsers.length)

  const openConfirm = (userId, mode) => {
    const user = localUsers.find((u) => String(u.id) === String(userId))
    if (!user || user.role === 'admin') return
    setConfirm({ open: true, userId, mode })
  }

  const closeConfirm = () => setConfirm({ open: false, userId: null, mode: null })

  const handleSuspendToggle = (userId) => {
    const user = localUsers.find((u) => String(u.id) === String(userId))
    if (!user || user.role === 'admin') return
    openConfirm(userId, (user.status || 'active') === 'active' ? 'suspend' : 'activate')
  }

  const handleDelete = (userId) => {
    const user = localUsers.find((u) => String(u.id) === String(userId))
    if (!user || user.role === 'admin') return
    openConfirm(userId, 'delete')
  }

  const performAction = async () => {
    const { userId, mode } = confirm
    const user = localUsers.find((u) => String(u.id) === String(userId))
    if (!user || user.role === 'admin' || !token) {
      closeConfirm()
      return
    }

    const nextStatus = mode === 'suspend' ? 'suspended' : mode === 'activate' ? 'active' : null
    setPendingAction({ userId, mode })

    try {
      if (mode === 'delete') {
        await dispatch(deleteUserAsync({ token, userId })).unwrap()
        showToast(`Deleted ${user.name}.`, { type: 'success' })
      } else if (nextStatus) {
        await dispatch(updateUserStatusAsync({ token, userId, status: nextStatus })).unwrap()
        showToast(
          `${nextStatus === 'suspended' ? 'Suspended' : 'Re-activated'} ${user.name}.`,
          { type: 'success' }
        )
      }

      dispatch(fetchAllUsers({ token }))
      dispatch(fetchUserStats({ token }))
    } catch (error) {
      showToast(error?.message || error || 'Action failed.', { type: 'error' })
    } finally {
      setPendingAction(null)
      closeConfirm()
    }
  }

  const confirmTitle =
    confirm.mode === 'delete'
      ? 'Delete user'
      : confirm.mode === 'suspend'
        ? 'Suspend user'
        : confirm.mode === 'activate'
          ? 'Re-activate user'
          : 'Confirm action'

  const confirmLabel =
    confirm.mode === 'delete'
      ? 'Delete'
      : confirm.mode === 'suspend'
        ? 'Suspend'
        : confirm.mode === 'activate'
          ? 'Re-activate'
          : 'Confirm'

  const confirmUser = localUsers.find((u) => u.id === confirm.userId)
  const confirmDescription =
    confirm.mode === 'delete'
      ? `This permanently deletes ${confirmUser?.name ?? 'this user'} and removes access to Trackit.`
      : confirm.mode === 'suspend'
        ? `${confirmUser?.name ?? 'This user'} will be blocked from signing in until re-activated.`
        : confirm.mode === 'activate'
          ? `${confirmUser?.name ?? 'This user'} will regain access and can sign in again.`
          : 'Please confirm the action.'

  const isInitialLoading =
    (usersLoading && localUsers.length === 0) || (statsLoading && !userStatsData && localUsers.length === 0)
  const errorMessage = usersError || statsError
  const handleRetry = () => {
    if (!token) return
    dispatch(fetchAllUsers({ token }))
    dispatch(fetchUserStats({ token }))
  }

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <SkeletonLoader cardCount={4} gridCols="md:grid-cols-4" showCharts={false} />
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">User management</p>
              <div className="mt-2 h-4 w-48 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-10 w-24 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="mt-6">
            <table className="w-full table-auto divide-y divide-slate-200 dark:divide-trackit-border">
              <TableHeader />
              <tbody className="bg-white dark:bg-slate-950">
                {[...Array(5)].map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="h-14 border-b border-slate-200 dark:border-trackit-border">
                    {skeletonWidths.map((width, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-4">
                        <div className={`h-3 rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse ${width}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <section className="grid gap-6 md:grid-cols-4">
            {[
              { label: 'Total users', value: statsToDisplay.total, detail: 'all registered accounts', icon: FiUser },
              { label: 'Active', value: statsToDisplay.active, detail: 'active within the last 7 days', icon: FiCheckCircle },
              { label: 'Suspended', value: statsToDisplay.suspended, detail: 'restricted access', icon: FiSlash },
              { label: 'Admins', value: statsToDisplay.admins, detail: 'administrators with full access', icon: FiShield },
            ].map((card) => (
            <motion.article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{card.label}</p>
                <card.icon className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-50">{formatStatValue(card.value)}</p>
              <p className="mt-1 text-sm leading-tight text-slate-500 dark:text-slate-400">{card.detail}</p>
            </motion.article>
          ))}
        </section>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm shadow-black/5 dark:border-rose-500/30 dark:bg-rose-500/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>Error: {errorMessage}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-950">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">User management</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Manage access and accounts</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Suspend users to block sign-in or delete accounts when required.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <FiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="w-full rounded-xl border border-slate-200/60 bg-white py-3 pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-950 dark:text-slate-50"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-950 dark:text-slate-200"
                >
                  <option value="all">All roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-950 dark:text-slate-200"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </header>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-trackit-border">
            <table className="w-full table-auto divide-y divide-slate-200 dark:divide-trackit-border">
              <TableHeader />
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-trackit-border dark:bg-slate-950">
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-600 dark:text-slate-400">
                      No users match the current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const status = user.status || 'active'
                    const role = user.role || 'user'
                    const isSuspended = status === 'suspended'
                    const isAdmin = role === 'admin'
                    const actionBusy = pendingAction?.userId === user.id

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                              {getInitials(user.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{user.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={[
                              badgeBase,
                              role === 'admin'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                                : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-trackit-border dark:bg-slate-900/40 dark:text-slate-300',
                            ].join(' ')}
                          >
                            {role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={[
                              badgeBase,
                              isSuspended
                                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
                            ].join(' ')}
                          >
                            {isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {formatDateTime(user.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {formatDateTime(user.lastActiveAt || user.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleSuspendToggle(user.id)}
                              className={[
                                'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
                                isAdmin
                                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                  : status === 'active'
                                    ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/15'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15',
                                actionBusy ? 'cursor-wait opacity-60' : '',
                              ].filter(Boolean).join(' ')}
                              disabled={isAdmin || actionBusy}
                            >
                              {status === 'active' ? <FiSlash className="h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
                              {status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id)}
                              className={[
                                'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
                                isAdmin
                                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/15',
                                actionBusy ? 'cursor-wait opacity-60' : '',
                              ].filter(Boolean).join(' ')}
                              disabled={isAdmin || actionBusy}
                            >
                              <FiTrash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            {sortedUsers.length > USERS_PER_PAGE && (
              <div className="mt-4 flex flex-col gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                  Showing {pageStart}–{pageEnd} of {sortedUsers.length} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className={[
                      'rounded-full border px-3 py-1 text-[0.65rem] font-semibold transition focus-visible:outline-none',
                      currentPage === 1
                        ? 'border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-trackit-border dark:bg-slate-900 dark:text-slate-300',
                    ].join(' ')}
                  >
                    Prev
                  </button>
                  <span className="text-[0.65rem] text-slate-600 dark:text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className={[
                      'rounded-full border px-3 py-1 text-[0.65rem] font-semibold transition focus-visible:outline-none',
                      currentPage === totalPages
                        ? 'border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-trackit-border dark:bg-slate-900 dark:text-slate-300',
                    ].join(' ')}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </motion.div>

      <ConfirmDialog
        open={confirm.open}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        danger={confirm.mode === 'delete'}
        onCancel={closeConfirm}
        onConfirm={performAction}
        confirmLoading={pendingAction?.userId === confirm.userId}
      />
    </>
  )
}

export default UserOversight
