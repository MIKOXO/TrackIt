import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import AddTransactionModal from '../../components/user/AddTransactionModal.jsx'
import SkeletonLoader from '../../components/ui/SkeletonLoader.jsx'
import { useToast } from '../../components/ui/ToastProvider.jsx'
import { fetchTransactions, addTransaction } from '../../store/slices/transactionSlice.js'
import { getServerMessage } from '../../utils/errorUtils.js'
import { formatCurrency } from '../../utils/currencyUtils.js'

const formatDateLabel = (value) => {
  if (!value) {
    return '—'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const Transactions = () => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const currency = useSelector((state) => state.auth.user?.currency ?? 'ETB')
  const { transactions, loading: isLoading } = useSelector((state) => state.transactions)
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isModalOpen, setModalOpen] = useState(false)
  const [isCreating, setCreating] = useState(false)
  const formatMoney = (value) => formatCurrency(value, currency)

  useEffect(() => {
    if (!isAuthenticated) return
    dispatch(fetchTransactions())
      .unwrap()
      .catch((error) => {
        showToast(
          getServerMessage({ response: { data: { message: error } } }, 'Unable to load transactions. Please refresh.'),
          { type: 'error' }
        )
      })
  }, [isAuthenticated, dispatch, showToast])

  const filteredTransactions = useMemo(() => {
    const byType = typeFilter === 'all' ? transactions : transactions.filter((t) => t.type === typeFilter)
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) {
      return byType
    }

    return byType.filter((transaction) => {
      const haystack = [
        transaction.category,
        transaction.type,
        transaction.description,
        formatDateLabel(transaction.date),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalized)
    })
  }, [searchTerm, typeFilter, transactions])

  const handleCreateTransaction = async (payload) => {
    if (!isAuthenticated) {
      const message = 'Please sign in again before adding a transaction.'
      showToast(message, { type: 'error' })
      throw new Error(message)
    }

    setCreating(true)
    try {
      await dispatch(addTransaction(payload)).unwrap()
      showToast('Transaction saved to your ledger.', { type: 'success' })
    } catch (error) {
      const message = getServerMessage({ response: { data: { message: error } } }, 'Unable to save the transaction right now.')
      showToast(message, { type: 'error' })
      throw error
    } finally {
      setCreating(false)
    }
  }

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white px-5 py-4 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
      >
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-600/90 dark:text-emerald-300/90">
            Transactions
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Track your money</h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Log income and expenses to keep the dashboard accurate.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-trackit-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <FiPlus className="h-4 w-4" />
          Add transaction
        </button>
      </motion.div>

      {isLoading && transactions.length === 0 ? (
        <SkeletonLoader cardCount={1} gridCols="lg:grid-cols-1" showCharts={false} />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-slate-200/60 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
              />
            </div>
            <div className="flex w-full gap-1 rounded-xl border border-slate-200/60 bg-white p-1 dark:border-trackit-border/60 dark:bg-slate-900/60 sm:w-auto">
              {[
                { value: 'all', label: 'All' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expenses' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTypeFilter(option.value)}
                  aria-pressed={typeFilter === option.value}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:flex-none ${
                    typeFilter === option.value
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
          >
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <p className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">No transactions found</p>
                <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  {searchTerm || typeFilter !== 'all'
                    ? 'Try a different search term or filter.'
                    : 'Add a transaction to kick off your financial journey.'}
                </p>
                {!searchTerm && typeFilter === 'all' && (
                  <button
                    type="button"
                    onClick={openModal}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-trackit-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <FiPlus className="h-4 w-4" />
                    Add my first transaction
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-200/60 dark:divide-trackit-border/60">
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === 'income'
                  return (
                    <li key={transaction._id} className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/20">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {transaction.category}
                          </p>
                          <span
                            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider ${
                              isIncome
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </div>
                        <p className="mt-0.5 max-w-[16rem] truncate text-[0.7rem] tabular-nums text-slate-400 dark:text-slate-500 sm:max-w-md md:max-w-lg">
                          {formatDateLabel(transaction.date)}
                          {transaction.description ? ` · ${transaction.description}` : ''}
                        </p>
                      </div>
                      <p
                        className={`flex-shrink-0 text-sm font-bold tabular-nums ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '−'}
                        {formatMoney(transaction.amount)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        </>
      )}

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={handleCreateTransaction}
        isSubmitting={isCreating}
      />
    </div>
  )
}

export default Transactions
