import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi'
import { setUser, setLoading, setError } from '../store/slices/authSlice'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/authService.js'
import { useToast } from '../components/ui/ToastProvider.jsx'
import { getServerMessage } from '../utils/errorUtils.js'
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx'

const SuspendedAccountModal = ({ open, heading, message, onClose }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-black/40 dark:border-trackit-border dark:bg-slate-900"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{heading}</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{message}</p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-trackit-border dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
)

const SignIn = () => {
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const { showToast } = useToast()
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
  })
  const [suspendedModal, setSuspendedModal] = useState({ open: false, message: '', heading: 'Account suspended' })

  const inputBaseClasses =
    'w-full rounded-xl border bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm shadow-black/5 transition focus:outline-none dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500'

  const getInputClass = (hasError, extra = '') => {
    const stateClass = hasError
      ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/60 dark:border-rose-500 dark:focus:border-rose-400'
      : 'border-slate-200/60 focus:border-emerald-400 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:focus:border-emerald-400'
    return `${inputBaseClasses} ${stateClass} ${extra}`.trim()
  }

  const isSignInReady = Boolean(formData.email.trim() && formData.password)
  const showSignInLoading = isSubmitting || loading

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (name === 'email' || name === 'password') {
      setFieldErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(setLoading(true))
    dispatch(setError(null))
    setFieldErrors({ email: false, password: false })
    setIsSubmitting(true)
    setSuspendedModal({ open: false, message: '' })

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      })
      dispatch(setUser({ user: response.data.user, token: response.data.token }))
      showToast('Signed in successfully', { type: 'success' })
      const destination = response.data.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      const finalDestination =
        response.data.user?.role !== 'admin' && !response.data.user?.securityQuestionSet
          ? '/security-question'
          : destination
      navigate(finalDestination, { replace: true })
    } catch (err) {
      const message = getServerMessage(err, 'Unable to sign in. Check your credentials.')
      dispatch(setError(message))
      showToast(message, { type: 'error' })
      const normalized = message.toLowerCase()
      if (/suspend|delete/i.test(normalized)) {
        setSuspendedModal({
          open: true,
          message,
          heading: /delete/i.test(normalized) ? 'Account deleted' : 'Account suspended',
        })
      }
      const credentialHint = /credentials|invalid/i.test(normalized)
      setFieldErrors({
        email: /email|user/i.test(normalized) || credentialHint,
        password:
          /password|credentials|invalid/i.test(normalized) || credentialHint,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const benefits = [
    { number: '1', text: 'Log in to your dashboard' },
    { number: '2', text: 'View your spending insights' },
    { number: '3', text: 'Chat with AI for advice' },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-trackit-background dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.95),_rgba(2,6,23,1)_70%)]" />
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center opacity-40 blur-3xl">
          <div className="h-64 w-[40rem] bg-emerald-500/40" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left side - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 flex flex-col justify-center"
            >
              <div className="space-y-2 mb-8">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
                  Welcome back
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Sign in to continue tracking your finances
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={getInputClass(fieldErrors.email)}
                  />
                </motion.div>

                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={getInputClass(fieldErrors.password, 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-4 w-4" />
                      ) : (
                        <FiEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Remember Me & Forgot Password */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center justify-between"
                >
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Forgot password?
                </Link>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  whileHover={isSignInReady && !showSignInLoading ? { y: -2 } : undefined}
                  whileTap={isSignInReady && !showSignInLoading ? { scale: 0.98 } : undefined}
                  type="submit"
                  disabled={!isSignInReady || showSignInLoading}
                  aria-busy={showSignInLoading}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-trackit-accent to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition ${
                    showSignInLoading || !isSignInReady
                      ? 'cursor-not-allowed opacity-80 shadow-none from-slate-500 via-slate-500 to-slate-600 bg-gradient-to-r disabled:text-slate-200'
                      : 'hover:shadow-xl'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {showSignInLoading ? (
                      <>
                        <LoadingIndicator />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <FiArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Sign Up Link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-center text-sm text-slate-600 dark:text-slate-400"
                >
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400">
                    Sign up
                  </Link>
                </motion.p>
              </form>
            </motion.div>

            {/* Right side - Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 hidden lg:flex flex-col justify-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-500/10 px-3 py-1 w-fit text-xs font-medium text-emerald-600 shadow-sm shadow-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-300">
                  <HiOutlineSparkles className="h-4 w-4" />
                  What you get
                </div>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-white/50 p-4 shadow-sm shadow-black/5 dark:border-trackit-border/60 dark:bg-slate-900/30"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-trackit-accent to-emerald-500 text-sm font-semibold text-white flex-shrink-0">
                        {benefit.number}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {benefit.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 space-y-4"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    🚀 New features rolling out
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    We're constantly improving TrackIt. Check back soon for AI-powered budget recommendations and spending alerts.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <SuspendedAccountModal
        open={suspendedModal.open}
        heading={suspendedModal.heading}
        message={suspendedModal.message}
        onClose={() => setSuspendedModal({ open: false, message: '', heading: 'Account suspended' })}
      />

      <Footer />
    </div>
  )
}

export default SignIn
