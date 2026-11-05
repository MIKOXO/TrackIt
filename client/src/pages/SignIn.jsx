import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, googleLogin } from '../services/authService.js';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { getServerMessage } from '../utils/errorUtils.js';
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
  const { showToast } = useToast();
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
  });
  const [suspendedModal, setSuspendedModal] = useState({
    open: false,
    message: '',
    heading: 'Account suspended',
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'email' || name === 'password') {
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));
    setFieldErrors({ email: false, password: false });
    setIsSubmitting(true);
    setSuspendedModal({ open: false, message: '' });

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      dispatch(setUser({ user: response.data.user }));
      showToast('Signed in successfully', { type: 'success' });
      const destination =
        response.data.user?.role === 'admin'
          ? '/admin/dashboard'
          : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const message = getServerMessage(
        err,
        'Unable to sign in. Check your credentials.',
      );

      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        dispatch(setError(null));
        showToast(message, { type: 'info' });
        navigate('/verify-email', {
          replace: true,
          state: { email: formData.email.trim(), codeSent: true },
        });
        return;
      }

      dispatch(setError(message));
      showToast(message, { type: 'error' });
      const normalized = message.toLowerCase();
      if (/suspend|delete/i.test(normalized)) {
        setSuspendedModal({
          open: true,
          message,
          heading: /delete/i.test(normalized)
            ? 'Account deleted'
            : 'Account suspended',
        });
      }
      const credentialHint = /credentials|invalid/i.test(normalized);
      setFieldErrors({
        email: /email|user/i.test(normalized) || credentialHint,
        password:
          /password|credentials|invalid/i.test(normalized) || credentialHint,
      });
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      showToast('Google sign-in failed.', { type: 'error' });
      return;
    }
    dispatch(setLoading(true));
    try {
      const response = await googleLogin({ credential });
      dispatch(setUser({ user: response.data.user }));
      showToast('Signed in successfully', { type: 'success' });
      const destination =
        response.data.user?.role === 'admin'
          ? '/admin/dashboard'
          : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const message = getServerMessage(err, 'Unable to sign in with Google.');
      dispatch(setError(message));
      showToast(message, { type: 'error' });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleError = () => {
    showToast('Google sign-in failed.', { type: 'error' });
  };

  return (
    <AuthLayout>
      <div className='mb-5'>
        <h1 className='text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50'>Welcome back</h1>
        <p className='mt-1.5 text-sm text-slate-600 dark:text-slate-400'>Sign in to continue tracking your finances</p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-3'>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? <>
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} isLoading={loading} />
          <div className='flex items-center gap-3 py-1'><div className='h-px flex-1 bg-slate-200 dark:bg-trackit-border' /><span className='text-xs text-slate-400'>or</span><div className='h-px flex-1 bg-slate-200 dark:bg-trackit-border' /></div>
        </> : null}
                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}>
                  <label className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>
                    Email address
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='you@example.com'
                    className={getInputClass(fieldErrors.email)}
                  />
                </motion.div>

                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}>
                  <label className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>
                    Password
                  </label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      value={formData.password}
                      onChange={handleChange}
                      placeholder='••••••••'
                      className={getInputClass(fieldErrors.password, 'pr-10')}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>
                      {showPassword ? (
                        <FiEyeOff className='h-4 w-4' />
                      ) : (
                        <FiEye className='h-4 w-4' />
                      )}
                    </button>
                  </div>
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
                  whileHover={
                    isSignInReady && !showSignInLoading ? { y: -2 } : undefined
                  }
                  whileTap={
                    isSignInReady && !showSignInLoading
                      ? { scale: 0.98 }
                      : undefined
                  }
                  type='submit'
                  disabled={!isSignInReady || showSignInLoading}
                  aria-busy={showSignInLoading}
                  className={getPrimaryButtonClass(
                    showSignInLoading || !isSignInReady,
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
