import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiArrowRight, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiX } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import OtpInput from '../components/auth/OtpInput.jsx'
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx'
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js'
import FieldError from '../components/auth/FieldError.jsx'
import FormAlert from '../components/auth/FormAlert.jsx'
import { useTimedMessage } from '../hooks/useTimedMessage.js'
import { mapAuthError, getRetryAfterSeconds } from '../utils/authErrorMapper.js'
import { AUTH_FEEDBACK_TIMEOUTS } from '../constants/authFeedback.js'
import { PASSWORD_REQUIREMENTS } from '../constants/passwordRequirements.js'
import {
  clearAuthFeedback,
  clearUser,
  requestPasswordReset,
  resendOtpCode,
  resetPasswordWithOtp,
} from '../store/slices/authSlice'

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

const ForgotPassword = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    resetRequestLoading,
    passwordResetLoading,
    resendLoading,
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

  const [step, setStep] = useState('request')
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [expiryCountdown, setExpiryCountdown] = useState(OTP_EXPIRY_SECONDS)
  const [fieldErrors, setFieldErrors] = useState({
    email: null,
    code: null,
    password: null,
    confirmPassword: null,
  })

  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)
  const confirmPasswordInputRef = useRef(null)
  const codeInputRef = useRef(null)
  const fieldErrorTimersRef = useRef({})
  const serverFieldErrorsRef = useRef(new Set())
  const rateLimitActiveRef = useRef(false)
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0)

  const inputClasses =
    'w-full rounded-xl border border-slate-200/60 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm shadow-black/5 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-emerald-400'

  const emailIsValid = /^\S+@\S+\.\S+$/.test(email.trim())
  const isRateLimited = rateLimitSeconds > 0
  const isCountingDown = countdown > 0
  const isExpiryCountingDown = expiryCountdown > 0
  const requirementState = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        ...requirement,
        isValid: Boolean(requirement.test(password)),
      })),
    [password],
  )
  const passwordIsValid = requirementState.every((requirement) => requirement.isValid)
  const passwordsMatch = password.length > 0 && password === confirmPassword
  const confirmMismatch = Boolean(confirmTouched && confirmPassword && !passwordsMatch)

  const handleBlockDismiss = () => {
    clear()
    setRateLimitSeconds(0)
    dispatch(clearAuthFeedback())
  }

  const clearFieldErrorTimer = (field) => {
    const timer = fieldErrorTimersRef.current[field]
    if (timer) {
      window.clearTimeout(timer)
      delete fieldErrorTimersRef.current[field]
    }
  }

  const clearAllFieldErrorTimers = () => {
    Object.values(fieldErrorTimersRef.current).forEach((timer) => window.clearTimeout(timer))
    fieldErrorTimersRef.current = {}
    serverFieldErrorsRef.current.clear()
  }

  const setServerFieldError = (field, message) => {
    if (!field || !['email', 'code', 'password', 'confirmPassword'].includes(field)) return
    serverFieldErrorsRef.current.add(field)
    setFieldErrors((current) => ({ ...current, [field]: message }))
    clearFieldErrorTimer(field)
    fieldErrorTimersRef.current[field] = window.setTimeout(() => {
      setFieldErrors((current) => current[field] === message ? { ...current, [field]: null } : current)
      serverFieldErrorsRef.current.delete(field)
      delete fieldErrorTimersRef.current[field]
    }, AUTH_FEEDBACK_TIMEOUTS.serverField)
  }

  const clearFieldErrorWhenValid = (field, valid) => {
    if (!serverFieldErrorsRef.current.has(field) && !valid) return
    serverFieldErrorsRef.current.delete(field)
    clearFieldErrorTimer(field)
    setFieldErrors((current) => ({ ...current, [field]: null }))
  }

  useEffect(() => () => Object.values(fieldErrorTimersRef.current).forEach((timer) => window.clearTimeout(timer)), [])
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

  const handleRequest = async (event) => {
    event.preventDefault()
    if (isRateLimited) return
    clear()
    setRateLimitSeconds(0)
    clearFieldErrorTimer('email')
    serverFieldErrorsRef.current.delete('email')
    setFieldErrors((current) => ({ ...current, email: null }))
    if (!emailIsValid) {
      setFieldErrors((prev) => ({ ...prev, email: email.trim() ? 'Enter a valid email address.' : 'Email address is required.' }))
      emailInputRef.current?.focus()
      return
    }

    try {
      const result = await dispatch(
        requestPasswordReset({ email: email.trim() }),
      ).unwrap()
      show(result?.message || 'If an account exists, a reset code has been sent.', 'info')
      setStep('otp')
      setCountdown(60)
      setExpiryCountdown(OTP_EXPIRY_SECONDS)
      setCode('')
      clearFieldErrorTimer('code')
      serverFieldErrorsRef.current.delete('code')
      setFieldErrors((current) => ({ ...current, code: null }))
      setResetKey((current) => current + 1)
    } catch (error) {
      const mapped = mapAuthError(error, 'Unable to start password reset.')
      const retryAfterSeconds = getRetryAfterSeconds(error, 0)
      if (retryAfterSeconds > 0) {
        setRateLimitSeconds(retryAfterSeconds)
        show(mapped.message, 'error', 0)
      } else if (mapped.scope === 'field') {
        setServerFieldError(mapped.field, mapped.message)
      } else {
        show(mapped.message, 'error')
      }
    }
  }

  const handleResend = async () => {
    if (isRateLimited || countdown > 0 || resendLoading) return
    clear()
    setRateLimitSeconds(0)

    dispatch(clearAuthFeedback())

    try {
      const result = await dispatch(
        resendOtpCode({ email: email.trim(), purpose: 'reset_password' }),
      ).unwrap()
      show(result?.message || 'A new reset code has been sent.', 'info')
      setCountdown(60)
      setExpiryCountdown(OTP_EXPIRY_SECONDS)
      setCode('')
      clearFieldErrorTimer('code')
      serverFieldErrorsRef.current.delete('code')
      setFieldErrors((current) => ({ ...current, code: null }))
      setResetKey((current) => current + 1)
    } catch (error) {
      const mapped = mapAuthError(error, 'Unable to send a new code.')
      if (mapped.retryAfter) {
        setCountdown(mapped.retryAfter)
        setRateLimitSeconds(mapped.retryAfter)
      }
      show(mapped.message, 'error', mapped.retryAfter ? 0 : undefined)
    }
  }

  const handleReset = async (event) => {
    event.preventDefault()
    if (isRateLimited) return
    clear()
    setRateLimitSeconds(0)
    if (code.length !== 6) {
      setFieldErrors((current) => ({ ...current, code: 'Enter the 6-digit code from your email.' }))
      setStep('otp')
      codeInputRef.current?.focus()
      return
    }
    if (!passwordIsValid) {
      const unmet = requirementState.filter((requirement) => !requirement.isValid)
      setFieldErrors((prev) => ({
        ...prev,
        password: `Password must include ${unmet.map((requirement) => requirement.label).join(', ')}`,
      }))
      passwordInputRef.current?.focus()
      return
    }
    if (!passwordsMatch) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords must match.' }))
      confirmPasswordInputRef.current?.focus()
      return
    }

    dispatch(clearAuthFeedback())

    try {
      const result = await dispatch(
        resetPasswordWithOtp({
          email: email.trim(),
          code,
          newPassword: password,
        }),
      ).unwrap()
      show(result?.message || 'Password reset successfully. Sign in with your new password.', 'success')
      dispatch(clearUser())
      navigate('/signin', { replace: true, state: { email: email.trim(), passwordReset: true } })
    } catch (error) {
      const mapped = mapAuthError(error, 'Unable to reset your password.')
      if (mapped.retryAfter) {
        setRateLimitSeconds(mapped.retryAfter)
        show(mapped.message, 'error', 0)
      } else if (mapped.scope === 'field') {
        setServerFieldError(mapped.field, mapped.message)
        if (mapped.field === 'code') {
          setStep('otp')
          window.setTimeout(() => codeInputRef.current?.focus(), 0)
        } else if (mapped.field === 'password') {
          passwordInputRef.current?.focus()
        }
      } else {
        if (mapped.code === 'OTP_MAX_ATTEMPTS') setStep('otp')
        show(mapped.message, 'error')
      }
    }
  }

  const handleUseDifferentEmail = () => {
    clearAllFieldErrorTimers()
    setStep('request')
    setCode('')
    setPassword('')
    setConfirmPassword('')
    setCountdown(0)
    setFieldErrors({ email: null, code: null, password: null, confirmPassword: null })
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

        <div className='mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='relative z-10 overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-2xl shadow-black/10 backdrop-blur dark:border-trackit-border/60 dark:bg-slate-900/50 sm:p-10'>
            <div className='flex items-center gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500'>
                {step === 'request' ? <FiMail className='h-6 w-6' /> : <FiLock className='h-6 w-6' />}
              </div>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500'>
                  Password recovery
                </p>
                <h1 className='mt-1 text-2xl font-semibold tracking-tight sm:text-3xl'>
                  {step === 'request'
                    ? 'Forgot your password?'
                    : step === 'otp'
                      ? 'Reset your password'
                      : 'Choose a new password'}
                </h1>
              </div>
            </div>

            {blockVisible ? (
              <div className='mt-6'>
                <FormAlert
                  variant={blockVariant}
                  message={rateLimitSeconds > 0 ? `${blockMessage} Try again in ${rateLimitSeconds}s.` : blockMessage}
                  onDismiss={handleBlockDismiss}
                  onPause={pause}
                  onResume={resume}
                />
              </div>
            ) : null}

            {step === 'request' ? (
              <>
                <p className='mt-5 text-sm text-slate-600 dark:text-slate-400'>
                  Enter the email address for your account. If it exists, we&apos;ll send a
                  6-digit reset code that expires in 10 minutes.
                </p>

                <form onSubmit={handleRequest} noValidate className='mt-8 space-y-6'>
                  <div>
                    <label
                      htmlFor='reset-email'
                      className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Email address
                    </label>
                    <input
                      id='reset-email'
                      ref={emailInputRef}
                      type='email'
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        clearFieldErrorWhenValid('email', /^\S+@\S+\.\S+$/.test(event.target.value.trim()))
                      }}
                      required
                      placeholder='you@example.com'
                      autoComplete='email'
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'reset-email-error' : undefined}
                      className={inputClasses}
                    />
                    <FieldError id='reset-email-error' message={fieldErrors.email} visible={Boolean(fieldErrors.email)} />
                  </div>

                  <button
                    type='submit'
                    disabled={resetRequestLoading || isRateLimited}
                    aria-busy={resetRequestLoading}
                    className={getPrimaryButtonClass(resetRequestLoading || isRateLimited)}>
                    <span className='inline-flex items-center gap-2'>
                      {resetRequestLoading ? (
                        <>
                          <LoadingIndicator />
                          Sending code...
                        </>
                      ) : (
                        <>
                          Send reset code
                          <FiArrowRight className='h-4 w-4' />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </>
            ) : step === 'otp' ? (
              <>
                <div className='mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                  <span>
                    We sent a reset code to{' '}
                    <span className='font-semibold text-slate-900 dark:text-slate-50'>
                      {maskEmail(email)}
                    </span>
                    . The code expires in{' '}
                    <span className='font-semibold text-slate-900 tabular-nums dark:text-slate-50'>
                      {formatCountdown(expiryCountdown)}
                    </span>
                    .
                  </span>
                  <button
                    type='button'
                    onClick={handleUseDifferentEmail}
                    className='inline-flex items-center gap-1 font-semibold text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'>
                    <FiArrowLeft className='h-3.5 w-3.5' />
                    Change email
                  </button>
                </div>

                <form onSubmit={handleReset} noValidate className='mt-8 space-y-6'>
                  <div>
                    <p className='mb-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Reset code
                    </p>
                    <OtpInput
                      key={resetKey}
                      value={code}
                      firstInputRef={codeInputRef}
                      onChange={(nextCode) => {
                        setCode(nextCode)
                        clearFieldErrorWhenValid('code', nextCode.length === 6)
                        dispatch(clearAuthFeedback())
                      }}
                      disabled={passwordResetLoading}
                      hasError={Boolean(fieldErrors.code)}
                      errorId='reset-otp-error'
                      autoFocus
                      label='Password reset code'
                      onComplete={() => setStep('password')}
                    />
                    <FieldError id='reset-otp-error' message={fieldErrors.code} visible={Boolean(fieldErrors.code)} />
                  </div>

                  <div className='flex flex-col items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400 sm:flex-row'>
                    <span>Didn&apos;t get the code?</span>
                    <button
                      type='button'
                      onClick={handleResend}
                      disabled={countdown > 0 || resendLoading || isRateLimited}
                      className='font-semibold text-emerald-500 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:text-slate-400 dark:hover:text-emerald-400 dark:disabled:text-slate-500'>
                      {resendLoading
                        ? 'Sending...'
                        : countdown > 0
                          ? `Resend code in ${countdown}s`
                          : 'Resend code'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <form onSubmit={handleReset} noValidate className='mt-8 space-y-6'>
                <div>
                  <label
                    htmlFor='reset-password'
                    className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                    New password
                  </label>
                  <div className='relative'>
                    <input
                      id='reset-password'
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        clearFieldErrorWhenValid('password', PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(event.target.value)))
                        dispatch(clearAuthFeedback())
                      }}
                      required
                      placeholder='••••••••'
                      autoComplete='new-password'
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? 'reset-password-error' : undefined}
                      className={`${inputClasses} pr-11 ${fieldErrors.password ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/30 dark:border-rose-500' : ''}`}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((current) => !current)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <FiEyeOff className='h-4 w-4' /> : <FiEye className='h-4 w-4' />}
                    </button>
                  </div>
                  <FieldError id='reset-password-error' message={fieldErrors.password} visible={Boolean(fieldErrors.password)} />
                </div>

                <div>
                  <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Password must include
                  </p>
                  <div className='mt-2 grid gap-2 text-sm sm:grid-cols-2'>
                    {requirementState.map((requirement) => (
                      <div key={requirement.id} className='flex items-center gap-2 rounded-xl border border-slate-200/40 bg-white/60 px-3 py-2 text-slate-600 shadow-sm shadow-black/5 dark:border-trackit-border/60 dark:bg-slate-900/40 dark:text-slate-300'>
                        {requirement.isValid ? (
                          <FiCheck className='h-4 w-4 text-emerald-400' aria-hidden />
                        ) : (
                          <FiX className='h-4 w-4 text-rose-400' aria-hidden />
                        )}
                        <span
                          className={
                            requirement.isValid
                              ? 'text-slate-900 dark:text-slate-50'
                              : 'text-slate-600 dark:text-slate-400'
                          }
                        >
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='reset-confirm-password'
                    className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Confirm new password
                  </label>
                  <div className='relative'>
                    <input
                      id='reset-confirm-password'
                      ref={confirmPasswordInputRef}
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value)
                        setConfirmTouched(true)
                        clearFieldErrorWhenValid('confirmPassword', Boolean(event.target.value && event.target.value === password))
                        dispatch(clearAuthFeedback())
                      }}
                      onBlur={() => setConfirmTouched(true)}
                      required
                      placeholder='••••••••'
                      autoComplete='new-password'
                      aria-invalid={Boolean(fieldErrors.confirmPassword || confirmMismatch)}
                      aria-describedby={fieldErrors.confirmPassword || confirmMismatch ? 'reset-confirm-password-error' : undefined}
                      className={`${inputClasses} pr-11 ${fieldErrors.confirmPassword || confirmMismatch ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/30 dark:border-rose-500' : ''}`}
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                      {showConfirmPassword ? <FiEyeOff className='h-4 w-4' /> : <FiEye className='h-4 w-4' />}
                    </button>
                  </div>
                  <FieldError
                    id='reset-confirm-password-error'
                    message={fieldErrors.confirmPassword || 'Passwords must match.'}
                    visible={Boolean(fieldErrors.confirmPassword || confirmMismatch)}
                  />
                </div>

                <button
                  type='submit'
                  disabled={passwordResetLoading || isRateLimited}
                  aria-busy={passwordResetLoading}
                  className={getPrimaryButtonClass(passwordResetLoading || isRateLimited)}>
                  <span className='inline-flex items-center gap-2'>
                    {passwordResetLoading ? (
                      <>
                        <LoadingIndicator />
                        Resetting password...
                      </>
                    ) : (
                      <>
                        Reset password
                        <FiArrowRight className='h-4 w-4' />
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

            <div className='mt-8 flex items-center justify-between border-t border-slate-200/60 pt-6 text-sm dark:border-trackit-border/60'>
              <Link
                to='/signin'
                className='inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'>
                <FiArrowLeft className='h-3.5 w-3.5' />
                Back to sign in
              </Link>
              {step === 'request' ? (
                <Link
                  to='/signup'
                  className='font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'>
                  Create an account
                </Link>
              ) : null}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ForgotPassword
