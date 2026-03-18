import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx'
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js'
import { useToast } from '../components/ui/ToastProvider.jsx'
import { getServerMessage } from '../utils/errorUtils.js'
import {
  fetchSecurityQuestionForEmail,
  verifySecurityQuestionAnswer,
} from '../services/authService.js'

const ForgotPassword = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)

  const isEmailReady = email.trim().length > 0
  const isAnswerReady = answer.trim().length > 0

  const handleFetchQuestion = async (event) => {
    event.preventDefault()
    if (!isEmailReady) {
      showToast('Enter your email first.', { type: 'error' })
      return
    }
    setLoading(true)

    try {
      const response = await fetchSecurityQuestionForEmail(email.trim())
      setQuestion(response.data.question)
      setStep('answer')
      setAnswer('')
      showToast('We found your security question. Answer it to continue.', { type: 'info' })
    } catch (err) {
      const message = getServerMessage(err, 'Unable to load the security question right now.')
      showToast(message, { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAnswer = async (event) => {
    event.preventDefault()
    if (!isAnswerReady) {
      showToast('Provide the answer to proceed.', { type: 'error' })
      return
    }
    setLoading(true)

    try {
      const response = await verifySecurityQuestionAnswer({
        email: email.trim(),
        question,
        answer: answer.trim(),
      })
      const token = response.data.resetToken
      showToast('Security question verified. Redirecting you to reset the password...', { type: 'success' })
      navigate('/reset-password', { state: { resetToken: token } })
    } catch (err) {
      const message = getServerMessage(err, 'Unable to verify your answer right now.')
      showToast(message, { type: 'error' })
    } finally {
      setLoading(false)
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-300">Account recovery</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Forgot your password?</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Recover access by answering the security question you set during onboarding. We will issue a short-lived token so you can reset your password.
            </p>

            <AnimatePresence mode="wait" initial={false}>
              {step === 'email' ? (
                <motion.form
                  key="email"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  onSubmit={handleFetchQuestion}
                  className="mt-8 space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-trackit-border/70 dark:bg-slate-800 dark:text-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className={getPrimaryButtonClass(!isEmailReady || loading)}
                    disabled={!isEmailReady || loading}
                  >
                    {loading && (
                      <span className="mr-2">
                        <LoadingIndicator />
                      </span>
                    )}
                    {loading ? 'Finding question...' : 'Find my security question'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="answer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  onSubmit={handleVerifyAnswer}
                  className="mt-8 space-y-6"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Security question</p>
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-900 dark:border-trackit-border/70 dark:bg-slate-800 dark:text-slate-50">
                      {question}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Answer</label>
                    <input
                      type="text"
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      placeholder="Enter your answer"
                      className="w-full rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-trackit-border/70 dark:bg-slate-800 dark:text-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className={getPrimaryButtonClass(!isAnswerReady || loading)}
                    disabled={!isAnswerReady || loading}
                  >
                    {loading && (
                      <span className="mr-2">
                        <LoadingIndicator />
                      </span>
                    )}
                    {loading ? 'Verifying...' : 'Verify answer'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            Remembered your password?{' '}
            <Link to="/signin" className="font-semibold text-emerald-600 dark:text-emerald-300">
              Sign in instead
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ForgotPassword
