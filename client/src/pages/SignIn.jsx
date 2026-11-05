import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, googleLogin } from '../services/authService.js';
import FieldError from '../components/auth/FieldError.jsx';
import FormAlert from '../components/auth/FormAlert.jsx';
import { useTimedMessage } from '../hooks/useTimedMessage.js';
import { mapAuthError, getRetryAfterSeconds } from '../utils/authErrorMapper.js';
import { AUTH_FEEDBACK_TIMEOUTS } from '../constants/authFeedback.js';
import GoogleAuthButton from '../components/auth/GoogleAuthButton.jsx';
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx';

const SuspendedAccountModal = ({ open, heading, message, onClose }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          className='w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-black/40 dark:border-trackit-border dark:bg-slate-900'
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
            {heading}
          </h3>
          <p className='mt-3 text-sm text-slate-600 dark:text-slate-300'>
            {message}
          </p>
          <div className='mt-6 flex justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-trackit-border dark:text-slate-200 dark:hover:bg-slate-800'>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

const SignIn = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email ?? '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loading } = useSelector((state) => state.auth);
  const [fieldErrors, setFieldErrors] = useState({
    email: null,
    password: null,
  });
  const [suspendedModal, setSuspendedModal] = useState({
    open: false,
    message: '',
    heading: 'Account suspended',
  });

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const fieldErrorTimersRef = useRef({});
  const serverFieldErrorsRef = useRef(new Set());
  const rateLimitActiveRef = useRef(false);

  const {
    message: blockMessage,
    variant: blockVariant,
    visible: blockVisible,
    show: showBlockAlert,
    clear: clearBlockAlert,
    pause: pauseBlockAlert,
    resume: resumeBlockAlert,
  } = useTimedMessage(AUTH_FEEDBACK_TIMEOUTS.blockError);

  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const isRateLimited = rateLimitSeconds > 0;

  const inputBaseClasses =
    'w-full rounded-xl border bg-white/80 px-4 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm shadow-black/5 transition focus:outline-none dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500';

  const getInputClass = (hasError, extra = '') => {
    const stateClass = hasError
      ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/60 dark:border-rose-500 dark:focus:border-rose-400'
      : 'border-slate-200/60 focus:border-emerald-400 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:focus:border-emerald-400';
    return `${inputBaseClasses} ${stateClass} ${extra}`.trim();
  };

  const isSignInReady = Boolean(formData.email.trim() && formData.password);
  const showSignInLoading = isSubmitting || loading;

  useEffect(
    () => () => {
      Object.values(fieldErrorTimersRef.current).forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  useEffect(() => {
    if (!isRateLimited) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setRateLimitSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRateLimited]);

  useEffect(() => {
    if (isRateLimited) {
      rateLimitActiveRef.current = true;
    } else if (rateLimitActiveRef.current) {
      rateLimitActiveRef.current = false;
      clearBlockAlert();
    }
  }, [isRateLimited, clearBlockAlert]);

  useEffect(() => {
    if (location.state?.passwordReset) {
      showBlockAlert('Password updated, please sign in', 'success');
      navigate(location.pathname, { replace: true, state: location.state.email ? { email: location.state.email } : null });
    }
  }, [location.pathname, location.state, navigate, showBlockAlert]);

  const clearFieldErrorTimer = (field) => {
    const timer = fieldErrorTimersRef.current[field];
    if (timer) {
      window.clearTimeout(timer);
      delete fieldErrorTimersRef.current[field];
    }
  };

  const clearAllFieldErrorTimers = () => {
    Object.values(fieldErrorTimersRef.current).forEach((timer) => window.clearTimeout(timer));
    fieldErrorTimersRef.current = {};
    serverFieldErrorsRef.current.clear();
  };

  const setServerFieldError = (field, message) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
    serverFieldErrorsRef.current.add(field);
    clearFieldErrorTimer(field);
    const timer = window.setTimeout(() => {
      serverFieldErrorsRef.current.delete(field);
      delete fieldErrorTimersRef.current[field];
      setFieldErrors((prev) => (prev[field] === message ? { ...prev, [field]: null } : prev));
    }, AUTH_FEEDBACK_TIMEOUTS.serverField);
    fieldErrorTimersRef.current[field] = timer;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'email' || name === 'password') {
      const isServerError = serverFieldErrorsRef.current.has(name);
      const isValid = name === 'email' ? /^\S+@\S+\.\S+$/.test(value.trim()) : Boolean(value);
      if (isServerError || isValid) {
        serverFieldErrorsRef.current.delete(name);
        clearFieldErrorTimer(name);
        setFieldErrors((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRateLimited) return;
    dispatch(setLoading(true));
    dispatch(setError(null));
    clearBlockAlert();
    setRateLimitSeconds(0);
    clearAllFieldErrorTimers();
    setFieldErrors({ email: null, password: null });
    setIsSubmitting(true);
    setSuspendedModal({ open: false, message: '', heading: 'Account suspended' });

    try {
      if (!formData.email.trim()) {
        setFieldErrors({ email: 'Email address is required.', password: null });
        emailInputRef.current?.focus();
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
        setFieldErrors({ email: 'Enter a valid email address.', password: null });
        emailInputRef.current?.focus();
        return;
      }

      if (!formData.password) {
        setFieldErrors({ email: null, password: 'Password is required.' });
        passwordInputRef.current?.focus();
        return;
      }

      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      dispatch(setUser({ user: response.data.user }));
      const destination =
        response.data.user?.role === 'admin'
          ? '/admin/dashboard'
          : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const mapped = mapAuthError(err, 'Unable to sign in. Check your credentials.');

      const retryAfterSeconds = getRetryAfterSeconds(err, 0);
      if (retryAfterSeconds > 0) {
        setRateLimitSeconds(retryAfterSeconds);
        showBlockAlert('Too many sign-in attempts.', 'error', 0);
        return;
      }

      if (mapped.code === 'EMAIL_NOT_VERIFIED') {
        dispatch(setError(null));
        navigate('/verify-email', {
          replace: true,
          state: { email: formData.email.trim(), codeSent: true },
        });
        return;
      }

      if (mapped.scope === 'field') {
        setServerFieldError(mapped.field, mapped.message);
        return;
      }

      dispatch(setError(mapped.message));
      const normalized = mapped.message.toLowerCase();
      if (/suspend|delete/i.test(normalized)) {
        setSuspendedModal({
          open: true,
          message: mapped.message,
          heading: /delete/i.test(normalized) ? 'Account deleted' : 'Account suspended',
        });
      } else {
        showBlockAlert(mapped.message, 'error');
      }
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (isRateLimited) return;
    const credential = credentialResponse?.credential;
    if (!credential) {
      showBlockAlert('Google sign-in failed.', 'error');
      return;
    }
    clearBlockAlert();
    setRateLimitSeconds(0);
    dispatch(setLoading(true));
    try {
      const response = await googleLogin({ credential });
      dispatch(setUser({ user: response.data.user }));
      const destination =
        response.data.user?.role === 'admin'
          ? '/admin/dashboard'
          : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const mapped = mapAuthError(err, 'Unable to sign in with Google.');
      dispatch(setError(mapped.message));
      const retryAfterSeconds = getRetryAfterSeconds(err, 0);
      if (retryAfterSeconds > 0) {
        setRateLimitSeconds(retryAfterSeconds);
        showBlockAlert('Too many sign-in attempts.', 'error', 0);
      } else {
        showBlockAlert(mapped.message, 'error');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleError = () => {
    showBlockAlert('Google sign-in failed.', 'error');
  };

  return (
    <AuthLayout>
      <div className='mb-5'>
        <h1 className='text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50'>Welcome back</h1>
        <p className='mt-1.5 text-sm text-slate-600 dark:text-slate-400'>Sign in to continue tracking your finances</p>
      </div>
      {blockVisible ? (
        <FormAlert
          variant={blockVariant}
          message={rateLimitSeconds > 0 ? `${blockMessage} Try again in ${rateLimitSeconds}s.` : blockMessage}
          onDismiss={() => { clearBlockAlert(); setRateLimitSeconds(0); }}
        onPause={pauseBlockAlert}
        onResume={resumeBlockAlert}
      />
      ) : null}
      <form onSubmit={handleSubmit} noValidate className='space-y-3'>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <>
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} isLoading={loading} disabled={isRateLimited} />
            <div className='flex items-center gap-3 py-1'>
              <div className='h-px flex-1 bg-slate-200 dark:bg-trackit-border' />
              <span className='text-xs text-slate-400'>or</span>
              <div className='h-px flex-1 bg-slate-200 dark:bg-trackit-border' />
            </div>
          </>
        ) : null}
        {/* Email Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <label htmlFor='signin-email' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>
            Email address
          </label>
          <input
            id='signin-email'
            ref={emailInputRef}
            type='email'
            required
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='you@example.com'
            autoComplete='email'
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined}
            className={getInputClass(Boolean(fieldErrors.email))}
          />
          <FieldError
            id='signin-email-error'
            message={fieldErrors.email}
            visible={Boolean(fieldErrors.email)}
          />
        </motion.div>

        {/* Password Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}>
          <label htmlFor='signin-password' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>
            Password
          </label>
          <div className='relative'>
            <input
              id='signin-password'
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              required
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='••••••••'
              autoComplete='current-password'
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}
              className={getInputClass(Boolean(fieldErrors.password), 'pr-10')}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>
              {showPassword ? <FiEyeOff className='h-4 w-4' /> : <FiEye className='h-4 w-4' />}
            </button>
          </div>
          <FieldError
            id='signin-password-error'
            message={fieldErrors.password}
            visible={Boolean(fieldErrors.password)}
          />
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className='flex items-center justify-between'>
          <button
            type='button'
            onClick={() => navigate('/forgot-password')}
            className='text-sm font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer'>
            Forgot password?
          </button>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          whileHover={isSignInReady && !showSignInLoading && !isRateLimited ? { y: -2 } : undefined}
          whileTap={isSignInReady && !showSignInLoading && !isRateLimited ? { scale: 0.98 } : undefined}
          type='submit'
          disabled={showSignInLoading || isRateLimited}
          aria-busy={showSignInLoading}
          className={getPrimaryButtonClass(
            showSignInLoading || isRateLimited,
          )}>
          <span className='inline-flex items-center gap-2'>
            {showSignInLoading ? (
              <>
                <LoadingIndicator />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <FiArrowRight className='h-4 w-4' />
              </>
            )}
          </span>
        </motion.button>

        {/* Sign Up Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className='text-center text-sm text-slate-600 dark:text-slate-400'>
          Don't have an account?{' '}
          <Link
            to='/signup'
            className='font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'>
            Sign up
          </Link>
        </motion.p>
      </form>
      <SuspendedAccountModal
        open={suspendedModal.open}
        heading={suspendedModal.heading}
        message={suspendedModal.message}
        onClose={() =>
          setSuspendedModal({
            open: false,
            message: '',
            heading: 'Account suspended',
          })
        }
      />
    </AuthLayout>
  );
};

export default SignIn;
