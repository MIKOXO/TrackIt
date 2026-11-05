import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiArrowRight, FiMail } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import OtpInput from '../components/auth/OtpInput.jsx'
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx'
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js'
import FieldError from '../components/auth/FieldError.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import { useTimedMessage } from '../hooks/useTimedMessage.js'
import { mapAuthError } from '../utils/authErrorMapper.js'
import { AUTH_FEEDBACK_TIMEOUTS } from '../constants/authFeedback.js'
import { clearAuthFeedback, resendOtpCode, verifyEmailCode } from '../store/slices/authSlice'

const OTP_EXPIRY_SECONDS = 10 * 60

const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

const maskEmail = (email) => {
  const value = String(email ?? '')
  const atIndex = value.indexOf('@')
  const local = atIndex === -1 ? value : value.slice(0, atIndex)
  const domain = atIndex === -1 ? '' : value.slice(atIndex)
  const keep = Math.ceil(local.length / 2)
  const visible = local.slice(0, keep)
  const covered = '*'.repeat(Math.max(0, local.length - keep))
  const masked = `${visible}${covered}${domain}`
  return masked || 'your email'
}

const getErrorHeading = (code) => {
  if (code === 'OTP_EXPIRED') return 'That code has expired'
  if (code === 'OTP_MAX_ATTEMPTS') return 'Too many attempts'
  if (code === 'OTP_COOLDOWN' || code === 'OTP_RATE_LIMITED') return 'Please wait a moment'
  return 'We could not verify that code'
}

const OTP_FIELD_ERROR_CODES = ['OTP_INVALID', 'OTP_EXPIRED']

const VerifyEmail = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    verificationLoading,
    verificationError,
    resendLoading,
    resendError,
  } = useSelector((state) => state.auth)
  const {
    message: blockMessage,
    variant: blockVariant,
    visible: blockVisible,
    show,
    clear,
    pause,
    resume,
  } = useTimedMessage(AUTH_FEEDBACK_TIMEOUTS.blockError)

  const [email] = useState(location.state?.email ?? '')
  const [code, setCode] = useState('')
  const [resetKey, setResetKey] = useState(0)
  const [countdown, setCountdown] = useState(location.state?.codeSent ? 60 : 0)
  const [expiryCountdown, setExpiryCountdown] = useState(OTP_EXPIRY_SECONDS)
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0)
  const [otpFieldError, setOtpFieldError] = useState(null)
  const otpInputRef = useRef(null)
  const fieldErrorTimerRef = useRef(null)
  const redirectTimerRef = useRef(null)
  const otpFieldErrorServerRef = useRef(false)
  const rateLimitActiveRef = useRef(false)

  const emailIsValid = /^\S+@\S+\.\S+$/.test(email.trim())
  const isCountingDown = countdown > 0
  const isExpiryCountingDown = expiryCountdown > 0
  const activeError = verificationError || resendError
  const mappedError = useMemo(() => mapAuthError(activeError, 'Unable to verify that code.'), [activeError])
  const isRateLimited = rateLimitSeconds > 0
  const canSubmit = emailIsValid && !verificationLoading && !isRateLimited

  useEffect(() => () => {
    window.clearTimeout(fieldErrorTimerRef.current)
    window.clearTimeout(redirectTimerRef.current)
  }, [])

  useEffect(() => {
    if (!isRateLimited) return undefined
    const timer = window.setInterval(() => setRateLimitSeconds((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [isRateLimited])

  useEffect(() => {
    if (isRateLimited) {
      rateLimitActiveRef.current = true
    } else if (rateLimitActiveRef.current) {
      rateLimitActiveRef.current = false
      clear()
    }
  }, [isRateLimited, clear])

  useEffect(() => {
    dispatch(clearAuthFeedback())
  }, [dispatch])

  useEffect(() => {
    if (location.state?.codeSent) {
      show('A verification code has been sent to your email.', 'info')
    }
  }, [location.state?.codeSent, show])

  useEffect(() => {
    if (!activeError) {
      clear()
      return undefined
    }
    if (OTP_FIELD_ERROR_CODES.includes(mappedError.code)) {
      clear()
      otpFieldErrorServerRef.current = true
      // Synchronize the local inline message with the rejected Redux request.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOtpFieldError(mappedError.message)
      window.clearTimeout(fieldErrorTimerRef.current)
      fieldErrorTimerRef.current = window.setTimeout(() => setOtpFieldError(null), AUTH_FEEDBACK_TIMEOUTS.serverField)
      return undefined
    }
    setOtpFieldError(null)
    show(mappedError.message, 'error', mappedError.retryAfter ? 0 : undefined)
    if (mappedError.retryAfter) setRateLimitSeconds(Number(mappedError.retryAfter))
    return undefined
  }, [activeError, mappedError, show, clear])

  useEffect(() => {
    if (!isCountingDown) {
      return undefined
    }
    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isCountingDown])

  useEffect(() => {
    if (!isExpiryCountingDown) {
      return undefined
    }
    const timer = window.setInterval(() => {
      setExpiryCountdown((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isExpiryCountingDown])

  const handleCodeChange = (nextCode) => {
    setCode(nextCode)
    if (otpFieldErrorServerRef.current || nextCode.length === 6) {
      otpFieldErrorServerRef.current = false
      setOtpFieldError(null)
      window.clearTimeout(fieldErrorTimerRef.current)
    }
    dispatch(clearAuthFeedback())
  }

  const handleVerify = async (submittedCode = code) => {
    if (verificationLoading || isRateLimited) return
    if (!emailIsValid) {
      show('Enter the email address you signed up with.', 'error')
      return
    }
    clear()
    setRateLimitSeconds(0)
    if (submittedCode.length !== 6) {
      otpFieldErrorServerRef.current = false
      setOtpFieldError('Enter the 6-digit code from your email.')
      otpInputRef.current?.focus()
      return
    }
    dispatch(clearAuthFeedback())

    try {
      const result = await dispatch(
        verifyEmailCode({ email: email.trim(), code: submittedCode }),
      ).unwrap()
      show(result?.message || 'Email verified successfully.', 'success')
      const destination =
        result?.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
      redirectTimerRef.current = window.setTimeout(() => navigate(destination, { replace: true }), 1400)
    } catch (error) {
      const mapped = mapAuthError(error, 'Unable to verify that code.')
      if (mapped.retryAfter) {
        setRateLimitSeconds(Number(mapped.retryAfter))
      }
    }
  }

  const handleResend = async () => {
    if (isRateLimited || countdown > 0 || resendLoading) return
    if (!emailIsValid) {
      show('Enter the email address you signed up with.', 'error')
      return
    }
    clear()
    setRateLimitSeconds(0)

    dispatch(clearAuthFeedback())

    try {
      const result = await dispatch(
        resendOtpCode({ email: email.trim(), purpose: 'verify_email' }),
      ).unwrap()
      show(result?.message || 'A new verification code has been sent.', 'info')
      setCountdown(60)
      setExpiryCountdown(OTP_EXPIRY_SECONDS)
      setCode('')
      setOtpFieldError(null)
      window.clearTimeout(fieldErrorTimerRef.current)
      setResetKey((current) => current + 1)
    } catch (error) {
      const mapped = mapAuthError(error, 'Unable to send a new code.')
      if (mapped.retryAfter) {
        setCountdown(mapped.retryAfter)
        setRateLimitSeconds(Number(mapped.retryAfter))
      }
    }
  }

  const handleBlockDismiss = () => {
    clear()
    dispatch(clearAuthFeedback())
  }

  return (
    <div className='min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-trackit-background dark:text-slate-50'>
      <div className='pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(15,23,42,0.95),_rgba(2,6,23,1)_70%)]' />
      <Navbar />

      <main className='relative overflow-hidden'>
        <div className='pointer-events-none absolute inset-x-0 -top-40 flex justify-center opacity-40 blur-3xl'>
          <div className='h-64 w-[40rem] bg-emerald-500/40' />
        </div>

        <div className='mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='relative z-10 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-4 shadow-2xl shadow-black/10 backdrop-blur dark:border-trackit-border/60 dark:bg-slate-900/50 sm:p-6'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500'>
                <FiMail className='h-6 w-6' />
              </div>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500'>
                  Verify your email
                </p>
                <h1 className='mt-1 text-xl font-semibold tracking-tight sm:text-2xl'>
                  Check your inbox
                </h1>
              </div>
            </div>

            <p className='mt-4 text-sm text-slate-600 dark:text-slate-400'>
              Enter the 6-digit code we sent to {maskEmail(email)}. The code expires in{' '}
              <span className='font-semibold text-slate-900 tabular-nums dark:text-slate-50'>
                {formatCountdown(expiryCountdown)}
              </span>
              .
            </p>

            {blockVisible ? (
              <FormAlert
                variant={blockVariant}
                message={rateLimitSeconds > 0 ? `${blockMessage} Try again in ${rateLimitSeconds}s.` : blockMessage}
                title={mappedError?.code ? getErrorHeading(mappedError.code) : undefined}
                onDismiss={handleBlockDismiss}
                onPause={pause}
                onResume={resume}
              />
            ) : null}

            <form
              onSubmit={(event) => {
                event.preventDefault()
                handleVerify()
              }}
              noValidate
              className='mt-4 space-y-5'>
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
                  errorId='verify-otp-error'
                  firstInputRef={otpInputRef}
                  autoFocus
                />
                <FieldError id='verify-otp-error' message={otpFieldError} visible={Boolean(otpFieldError)} />
              </div>

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
                  disabled={countdown > 0 || resendLoading || !emailIsValid || isRateLimited}
                  className='font-semibold text-emerald-500 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:text-slate-400 dark:hover:text-emerald-400 dark:disabled:text-slate-500'>
                  {resendLoading
                    ? 'Sending...'
                    : countdown > 0
                      ? `Resend code in ${countdown}s`
                      : 'Resend code'}
                </button>
              </div>
            </form>

            <div className='mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200/60 pt-5 text-sm dark:border-trackit-border/60 sm:flex-row'>
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
