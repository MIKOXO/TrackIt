import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiArrowRight, FiMail } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import OtpInput from '../components/auth/OtpInput.jsx'
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx'
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js'
import { useToast } from '../components/ui/ToastProvider.jsx'
import {
  clearAuthFeedback,
  resendOtpCode,
  verifyEmailCode,
} from '../store/slices/authSlice'

const getErrorHeading = (code) => {
  if (code === 'OTP_EXPIRED') return 'That code has expired'
  if (code === 'OTP_MAX_ATTEMPTS') return 'Too many attempts'
  if (code === 'OTP_COOLDOWN' || code === 'OTP_RATE_LIMITED') return 'Please wait a moment'
  return 'We could not verify that code'
}

const VerifyEmail = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const {
    verificationLoading,
    verificationError,
    resendLoading,
    resendError,
  } = useSelector((state) => state.auth)

  const [email, setEmail] = useState(location.state?.email ?? '')
  const [code, setCode] = useState('')
  const [resetKey, setResetKey] = useState(0)
  const [countdown, setCountdown] = useState(location.state?.codeSent ? 60 : 0)

  const emailIsValid = /^\S+@\S+\.\S+$/.test(email.trim())
  const isCountingDown = countdown > 0
  const activeError = verificationError || resendError
  const canSubmit = emailIsValid && code.length === 6 && !verificationLoading

  useEffect(() => {
    dispatch(clearAuthFeedback())
  }, [dispatch])

  useEffect(() => {
    if (!isCountingDown) {
      return undefined
    }
    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isCountingDown])

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
    dispatch(clearAuthFeedback())
  }

  const handleCodeChange = (nextCode) => {
    setCode(nextCode)
    dispatch(clearAuthFeedback())
  }

  const handleVerify = async (submittedCode = code) => {
    if (!emailIsValid) {
      showToast('Enter the email address you signed up with.', { type: 'error' })
      return
    }
    if (submittedCode.length !== 6 || verificationLoading) {
      return
    }

    dispatch(clearAuthFeedback())

    try {
      const result = await dispatch(
        verifyEmailCode({ email: email.trim(), code: submittedCode }),
      ).unwrap()
      showToast(result?.message || 'Email verified successfully.', { type: 'success' })
      const destination =
        result?.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      navigate(destination, { replace: true })
    } catch (error) {
      showToast(error?.message || 'Unable to verify that code.', { type: 'error' })
      setCode('')
      setResetKey((current) => current + 1)
      if (error?.retryAfter) {
        setCountdown(error.retryAfter)
      }
    }
  }

  const handleResend = async () => {
    if (!emailIsValid) {
      showToast('Enter the email address you signed up with.', { type: 'error' })
      return
    }
    if (countdown > 0 || resendLoading) {
      return
    }

    dispatch(clearAuthFeedback())

    try {
      const result = await dispatch(
        resendOtpCode({ email: email.trim(), purpose: 'verify_email' }),
      ).unwrap()
      showToast(result?.message || 'A new verification code has been sent.', {
        type: 'success',
      })
      setCountdown(60)
      setCode('')
      setResetKey((current) => current + 1)
    } catch (error) {
      showToast(error?.message || 'Unable to send a new code.', { type: 'error' })
      if (error?.retryAfter) {
        setCountdown(error.retryAfter)
      }
    }
  }

  return (
    <div className='min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-trackit-background dark:text-slate-50'>
      <div className='pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.95),_rgba(2,6,23,1)_70%)]' />
      <Navbar />

      <main className='relative overflow-hidden'>
        <div className='pointer-events-none absolute inset-x-0 -top-40 flex justify-center opacity-40 blur-3xl'>
          <div className='h-64 w-[40rem] bg-emerald-500/40' />
        </div>

        <div className='mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='relative z-10 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-2xl shadow-black/10 backdrop-blur dark:border-trackit-border/60 dark:bg-slate-900/50 sm:p-10'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500'>
                <FiMail className='h-6 w-6' />
              </div>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500'>
                  Verify your email
                </p>
                <h1 className='mt-1 text-2xl font-semibold tracking-tight sm:text-3xl'>
                  Check your inbox
                </h1>
              </div>
            </div>

            <p className='mt-5 text-sm text-slate-600 dark:text-slate-400'>
              Enter the 6-digit code we sent to{' '}
              <span className='font-semibold text-slate-900 dark:text-slate-50'>
                {email || 'your email address'}
              </span>
              . The code expires in 10 minutes.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                handleVerify()
              }}
              className='mt-8 space-y-6'>
              <div>
                <label
                  htmlFor='verify-email'
                  className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Email address
                </label>
                <input
                  id='verify-email'
                  type='email'
                  value={email}
                  onChange={handleEmailChange}
                  placeholder='you@example.com'
                  autoComplete='email'
                  className='w-full rounded-xl border border-slate-200/60 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm shadow-black/5 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-emerald-400'
                />
              </div>

              <div>
                <p className='mb-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Verification code
                </p>
                <OtpInput
                  key={resetKey}
                  value={code}
                  onChange={handleCodeChange}
                  onComplete={handleVerify}
                  disabled={verificationLoading}
                  hasError={Boolean(verificationError)}
                  autoFocus
                />
              </div>

              {activeError ? (
                <div
                  role='alert'
                  className='rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200'>
                  <p className='font-semibold'>{getErrorHeading(activeError.code)}</p>
                  <p className='mt-1'>{activeError.message}</p>
                  {activeError.attemptsRemaining !== null &&
                  activeError.attemptsRemaining !== undefined ? (
                    <p className='mt-1 text-xs font-medium'>
                      {activeError.attemptsRemaining} attempt
                      {activeError.attemptsRemaining === 1 ? '' : 's'} remaining.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <button
                type='submit'
                disabled={!canSubmit}
                aria-busy={verificationLoading}
                className={getPrimaryButtonClass(!canSubmit)}>
                <span className='inline-flex items-center gap-2'>
                  {verificationLoading ? (
                    <>
                      <LoadingIndicator />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify email
                      <FiArrowRight className='h-4 w-4' />
                    </>
                  )}
                </span>
              </button>

              <div className='flex flex-col items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400 sm:flex-row'>
                <span>Didn&apos;t get the code?</span>
                <button
                  type='button'
                  onClick={handleResend}
                  disabled={countdown > 0 || resendLoading || !emailIsValid}
                  className='font-semibold text-emerald-500 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:text-slate-400 dark:hover:text-emerald-400 dark:disabled:text-slate-500'>
                  {resendLoading
                    ? 'Sending...'
                    : countdown > 0
                      ? `Resend code in ${countdown}s`
                      : 'Resend code'}
                </button>
              </div>
            </form>

            <div className='mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200/60 pt-6 text-sm dark:border-trackit-border/60 sm:flex-row'>
              <Link
                to='/signin'
                className='font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'>
                Back to sign in
              </Link>
              <Link
                to='/signup'
                className='font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'>
                Use a different email
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default VerifyEmail
