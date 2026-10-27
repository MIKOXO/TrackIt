import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiArrowRight, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiX } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import OtpInput from '../components/auth/OtpInput.jsx'
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx'
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js'
import { useToast } from '../components/ui/ToastProvider.jsx'
import { PASSWORD_REQUIREMENTS } from '../constants/passwordRequirements.js'
import {
  clearAuthFeedback,
  clearUser,
  requestPasswordReset,
  resendOtpCode,
  resetPasswordWithOtp,
} from '../store/slices/authSlice'

const getErrorHeading = (code) => {
  if (code === 'OTP_EXPIRED') return 'That code has expired'
  if (code === 'OTP_MAX_ATTEMPTS') return 'Too many attempts'
  if (code === 'OTP_COOLDOWN' || code === 'OTP_RATE_LIMITED') return 'Please wait a moment'
  return 'We could not reset your password'
}

const ForgotPassword = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const {
    resetRequestLoading,
    resetRequestError,
    passwordResetLoading,
    passwordResetError,
    resendLoading,
    resendError,
  } = useSelector((state) => state.auth)

  const [step, setStep] = useState('request')
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [countdown, setCountdown] = useState(0)

  const emailIsValid = /^\S+@\S+\.\S+$/.test(email.trim())
  const isCountingDown = countdown > 0
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
  const activeError =
    step === 'request' ? resetRequestError : passwordResetError || resendError
  const isResetReady =
    emailIsValid && code.length === 6 && passwordIsValid && passwordsMatch

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

  const handleRequest = async (event) => {
    event.preventDefault()
    if (!emailIsValid) {
      showToast('Enter the email address for your account.', { type: 'error' })
      return
    }

    try {
      const result = await dispatch(
        requestPasswordReset({ email: email.trim() }),
      ).unwrap()
      showToast(
        result?.message || 'If an account exists, a reset code has been sent.',
        { type: 'success' },
      )
      setStep('reset')
      setCountdown(60)
      setCode('')
      setResetKey((current) => current + 1)
    } catch (error) {
      showToast(error?.message || 'Unable to start password reset.', { type: 'error' })
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) {
      return
    }

    dispatch(clearAuthFeedback())

    try {
      const result = await dispatch(
        resendOtpCode({ email: email.trim(), purpose: 'reset_password' }),
      ).unwrap()
      showToast(result?.message || 'A new reset code has been sent.', { type: 'success' })
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

  const handleReset = async (event) => {
    event.preventDefault()
    if (!passwordIsValid) {
      const unmet = requirementState.filter((requirement) => !requirement.isValid)
      showToast(
        `Password must include ${unmet.map((requirement) => requirement.label).join(', ')}`,
        { type: 'error' },
      )
      return
    }
    if (!passwordsMatch) {
      showToast('Passwords must match.', { type: 'error' })
      return
    }
    if (code.length !== 6) {
      showToast('Enter the 6-digit code from your email.', { type: 'error' })
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
      showToast(result?.message || 'Password reset successfully.', { type: 'success' })
      dispatch(clearUser())
      navigate('/signin', { replace: true, state: { email: email.trim() } })
    } catch (error) {
      showToast(error?.message || 'Unable to reset your password.', { type: 'error' })
      setCode('')
      setResetKey((current) => current + 1)
      if (error?.retryAfter) {
        setCountdown(error.retryAfter)
      }
    }
  }

  const handleUseDifferentEmail = () => {
    setStep('request')
    setCode('')
    setPassword('')
    setConfirmPassword('')
    setCountdown(0)
    dispatch(clearAuthFeedback())
  }

  const inputClasses =
    'w-full rounded-xl border border-slate-200/60 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm shadow-black/5 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-emerald-400'

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
                {step === 'request' ? (
                  <FiMail className='h-6 w-6' />
                ) : (
                  <FiLock className='h-6 w-6' />
                )}
              </div>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500'>
                  Password recovery
                </p>
                <h1 className='mt-1 text-2xl font-semibold tracking-tight sm:text-3xl'>
                  {step === 'request' ? 'Forgot your password?' : 'Choose a new password'}
                </h1>
              </div>
            </div>

            {step === 'request' ? (
              <>
                <p className='mt-5 text-sm text-slate-600 dark:text-slate-400'>
                  Enter the email address for your account. If it exists, we&apos;ll send a
                  6-digit reset code that expires in 10 minutes.
                </p>

                <form onSubmit={handleRequest} className='mt-8 space-y-6'>
                  <div>
                    <label
                      htmlFor='reset-email'
                      className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Email address
                    </label>
                    <input
                      id='reset-email'
                      type='email'
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        dispatch(clearAuthFeedback())
                      }}
                      placeholder='you@example.com'
                      autoComplete='email'
                      className={inputClasses}
                    />
                  </div>

                  {activeError ? (
                    <div
                      role='alert'
                      className='rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200'>
                      <p className='font-semibold'>{getErrorHeading(activeError.code)}</p>
                      <p className='mt-1'>{activeError.message}</p>
                    </div>
                  ) : null}

                  <button
                    type='submit'
                    disabled={!emailIsValid || resetRequestLoading}
                    aria-busy={resetRequestLoading}
                    className={getPrimaryButtonClass(!emailIsValid || resetRequestLoading)}>
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
            ) : (
              <>
                <div className='mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                  <span>
                    We sent a reset code to{' '}
                    <span className='font-semibold text-slate-900 dark:text-slate-50'>
                      {email}
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

                <form onSubmit={handleReset} className='mt-8 space-y-6'>
                  <div>
                    <p className='mb-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Reset code
                    </p>
                    <OtpInput
                      key={resetKey}
                      value={code}
                      onChange={(nextCode) => {
                        setCode(nextCode)
                        dispatch(clearAuthFeedback())
                      }}
                      disabled={passwordResetLoading}
                      hasError={Boolean(passwordResetError)}
                      autoFocus
                      label='Password reset code'
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

                  <div>
                    <label
                      htmlFor='reset-password'
                      className='mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                      New password
                    </label>
                    <div className='relative'>
                      <input
                        id='reset-password'
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value)
                          dispatch(clearAuthFeedback())
                        }}
                        placeholder='••••••••'
                        autoComplete='new-password'
                        className={`${inputClasses} pr-11`}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword((current) => !current)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? (
                          <FiEyeOff className='h-4 w-4' />
                        ) : (
                          <FiEye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </div>

                  <div aria-live='polite'>
                    <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Password must include
                    </p>
                    <ul className='mt-2 grid gap-2 text-sm sm:grid-cols-2'>
                      {requirementState.map((requirement) => (
                        <li
                          key={requirement.id}
                          className='flex items-center gap-2 rounded-xl border border-slate-200/40 bg-white/60 px-3 py-2 text-slate-600 shadow-sm shadow-black/5 dark:border-trackit-border/60 dark:bg-slate-900/40 dark:text-slate-300'>
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
                            }>
                            {requirement.label}
                          </span>
                        </li>
                      ))}
                    </ul>
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
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value)
                          dispatch(clearAuthFeedback())
                        }}
                        placeholder='••••••••'
                        autoComplete='new-password'
                        className={`${inputClasses} pr-11`}
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        aria-label={
                          showConfirmPassword ? 'Hide password' : 'Show password'
                        }>
                        {showConfirmPassword ? (
                          <FiEyeOff className='h-4 w-4' />
                        ) : (
                          <FiEye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch ? (
                      <p className='mt-2 text-xs font-medium text-rose-500'>
                        Passwords must match.
                      </p>
                    ) : null}
                  </div>

                  <button
                    type='submit'
                    disabled={!isResetReady || passwordResetLoading}
                    aria-busy={passwordResetLoading}
                    className={getPrimaryButtonClass(
                      !isResetReady || passwordResetLoading,
                    )}>
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

                  <div className='flex flex-col items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400 sm:flex-row'>
                    <span>Didn&apos;t get the code?</span>
                    <button
                      type='button'
                      onClick={handleResend}
                      disabled={countdown > 0 || resendLoading}
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
            )}

            <div className='mt-8 flex items-center justify-between border-t border-slate-200/60 pt-6 text-sm dark:border-trackit-border/60'>
              <Link
                to='/signin'
                className='inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'>
                <FiArrowLeft className='h-4 w-4' />
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
