import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiFilter, FiPlus, FiSearch } from 'react-icons/fi'
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
  const token = useSelector((state) => state.auth.token)
  const currency = useSelector((state) => state.auth.user?.currency ?? 'ETB')
  const { transactions, loading: isLoading } = useSelector((state) => state.transactions)
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setModalOpen] = useState(false)
  const [isCreating, setCreating] = useState(false)
  const formatMoney = (value) => formatCurrency(value, currency)

  useEffect(() => {
    if (!token) return
    dispatch(fetchTransactions(token))
      .unwrap()
      .catch((error) => {
        showToast(
          getServerMessage({ response: { data: { message: error } } }, 'Unable to load transactions. Please refresh.'),
          { type: 'error' }
        )
      })
  }, [token, dispatch, showToast])

  const filteredTransactions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) {
      return transactions
    }

    return transactions.filter((transaction) => {
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
  }, [searchTerm, transactions])

  const handleCreateTransaction = async (payload) => {
    if (!token) {
      const message = 'Please sign in again before adding a transaction.'
      showToast(message, { type: 'error' })
      throw new Error(message)
    }

    setCreating(true)
    try {
      await dispatch(addTransaction({ payload, token })).unwrap()
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30 sm:p-6"
      >
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600/90 dark:text-emerald-300/90">
              Transactions
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Track your money</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Log income and expenses to keep the dashboard accurate and see trends over time.
            </p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white px-5 py-3 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 dark:border-trackit-border/60 dark:bg-slate-900/50 dark:text-slate-50"
          >
            <FiPlus className="h-4 w-4 stroke-[2]" />
            Add transaction
          </button>
        </div>
      </motion.div>

      {isLoading && transactions.length === 0 ? (
        <SkeletonLoader cardCount={1} gridCols="lg:grid-cols-1" showCharts={false} />
      ) : (
        <>
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
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-slate-200/60 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:hover:bg-slate-800/50">
              <FiFilter className="h-5 w-5" />
              Filter
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
          >
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-slate-500 dark:text-slate-300">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">No transactions yet</p>
                <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
                  Add a transaction to kick off your financial journey. Income, expenses, and savings are all welcome.
                </p>
                <button
                  type="button"
                  onClick={openModal}
                  className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white px-5 py-2 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:border-trackit-border/60 dark:bg-slate-900/50 dark:text-slate-50"
                >
                  <FiPlus className="h-4 w-4" />
                  Add my first transaction
                </button>
              </div>
            ) : (
              <div className="space-y-4 px-6 py-6">
                {filteredTransactions.map((transaction) => {
                  const badgeClass =
                    transaction.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
                      : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200'
                  return (
                    <div
                      key={transaction._id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200/50 bg-slate-50/50 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {transaction.category}
                          </p>
                          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                            {formatMoney(transaction.amount)}
                          </p>
                        </div>
                        <span className={`rounded-2xl px-4 py-1 text-sm font-semibold ${badgeClass}`}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-slate-500 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                        <p>{formatDateLabel(transaction.date)}</p>
                        {transaction.description && (
                          <p className="max-w-xl text-slate-600 dark:text-slate-400">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
