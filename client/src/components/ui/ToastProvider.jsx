import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

const ToastContext = createContext(null)
const DEFAULT_DURATION = 4500

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload]
    case 'REMOVE_TOAST':
      return state.filter((toast) => toast.id !== action.payload)
    default:
      return state
  }
}

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, [])

  const showToast = useCallback((message, options = {}) => {
    const { type = 'info', duration = DEFAULT_DURATION } = options
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } })

    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id })
      }, duration)
    }
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  const toastStyles = {
    success: 'bg-emerald-500/95 text-white',
    error: 'bg-rose-500/95 text-white',
    info: 'bg-slate-900/95 text-white',
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 flex justify-center px-4 sm:justify-end">
        <div className="flex w-full max-w-sm flex-col gap-3">
          <AnimatePresence initial={false}>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-2xl shadow-black/15 ${toastStyles[toast.type] ?? toastStyles.info}`}
                role="status"
                aria-live="polite"
              >
                <p className="text-sm font-semibold leading-tight">{toast.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
