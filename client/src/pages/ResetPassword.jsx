import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx'
import { useToast } from '../components/ui/ToastProvider.jsx'
import { getServerMessage } from '../utils/errorUtils.js'
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js'
import { resetPasswordWithToken } from '../services/authService.js'
import { PASSWORD_REQUIREMENTS } from '../constants/passwordRequirements.js'

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    resetToken: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const prefill = location.state?.resetToken
    if (prefill) {
      setFormData((prev) => ({ ...prev, resetToken: prefill }))
    }
  }, [location.state])

  const requirementState = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        ...requirement,
        isValid: requirement.test(formData.newPassword),
      })),
    [formData.newPassword],
  )

  const isFormReady =
    formData.resetToken.trim() &&
    formData.newPassword &&
    formData.confirmPassword &&
    requirementState.every((requirement) => requirement.isValid) &&
    formData.newPassword === formData.confirmPassword

  const unmetRequirements = requirementState.filter((requirement) => !requirement.isValid)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.resetToken.trim()) {
      showToast('Reset token is required.', { type: 'error' })
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Passwords must match.', { type: 'error' })
      return
    }
    if (unmetRequirements.length) {
      showToast('Please meet all password requirements.', { type: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      await resetPasswordWithToken({
        resetToken: formData.resetToken.trim(),
        newPassword: formData.newPassword,
      })
      showToast('Password reset successful. Please sign in with your new password.', { type: 'success' })
      navigate('/signin', { replace: true })
    } catch (err) {
      const message = getServerMessage(err, 'Unable to reset password right now.')
      showToast(message, { type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-trackit-background dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.95),_rgba(2,6,23,1)_70%)]" />
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-slate-200/60 bg-white/90 p-8 shadow-2xl shadow-black/10 backdrop-blur dark:border-trackit-border/80 dark:bg-slate-900/80"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-300">Reset password</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Reset your password</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              The reset token was already generated after you verified your security question. Pick a new password that satisfies the requirements below.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <input type="hidden" name="resetToken" value={formData.resetToken} />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">New password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Create a new password"
                  className="w-full rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-trackit-border/70 dark:bg-slate-800 dark:text-slate-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  className="w-full rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-trackit-border/70 dark:bg-slate-800 dark:text-slate-50"
                />
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password requirements</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {requirementState.map((requirement) => (
                    <p
                      key={requirement.id}
                      className={`text-sm ${requirement.isValid ? 'text-emerald-600' : 'text-slate-500'}`}
                    >
                      {requirement.label}
                    </p>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormReady || isSubmitting}
                className={getPrimaryButtonClass(!isFormReady || isSubmitting)}
              >
                {isSubmitting && (
                  <span className="mr-2">
                    <LoadingIndicator />
                  </span>
                )}
                {isSubmitting ? 'Resetting password...' : 'Reset my password'}
              </button>

            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ResetPassword
