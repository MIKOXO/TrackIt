import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowRight, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService.js';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { getServerMessage } from '../utils/errorUtils.js';
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx';

const PASSWORD_REQUIREMENTS = [
  {
    id: 'length',
    label: 'At least 10 characters',
    test: (value) => value.length >= 10,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: 'One symbol (e.g. !@#$%)',
    test: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
]

const SignUp = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputBaseClasses =
    'w-full rounded-xl border bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm shadow-black/5 transition focus:outline-none dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500';

  const getInputClass = (hasError, extra = '') => {
    const stateClass = hasError
      ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/60 dark:border-rose-500 dark:focus:border-rose-400'
      : 'border-slate-200/60 focus:border-emerald-400 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:focus:border-emerald-400';
    return `${inputBaseClasses} ${stateClass} ${extra}`.trim();
  };

  const requirementState = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        ...requirement,
        isValid: requirement.test(formData.password),
      })),
    [formData.password],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email' || name === 'password' || name === 'confirmPassword') {
      setFieldErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const isSignUpReady = Boolean(
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.confirmPassword &&
    agreedToTerms,
  );
  const showSignUpLoading = isSubmitting || loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));
    setFieldErrors({ email: false, password: false, confirmPassword: false });
    setIsSubmitting(true);

    const unmetRequirements = requirementState.filter(
      (requirement) => !requirement.isValid,
    );

    if (unmetRequirements.length) {
      const message = `Password must include ${unmetRequirements
        .map((requirement) => requirement.label)
        .join(', ')}`;
      dispatch(setError(message));
      showToast(message, { type: 'error' });
      setFieldErrors((prev) => ({ ...prev, password: true }));
      setIsSubmitting(false);
      dispatch(setLoading(false));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const message = 'Passwords must match';
      dispatch(setError(message));
      showToast(message, { type: 'error' });
      setFieldErrors((prev) => ({ ...prev, password: true, confirmPassword: true }));
      setIsSubmitting(false);
      dispatch(setLoading(false));
      return;
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      dispatch(
        setUser({ user: response.data.user, token: response.data.token }),
      );
      window.localStorage.setItem('trackitToken', response.data.token);
      showToast('Account created successfully', { type: 'success' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = getServerMessage(err, 'Unable to create account. Try again shortly.');
      dispatch(setError(message));
      showToast(message, { type: 'error' });
      const normalized = message.toLowerCase();
      setFieldErrors({
        email: /email|account|already|exists/i.test(normalized),
        password: /password|weak|strength|include|symbol|credentials/i.test(normalized),
        confirmPassword: /match|confirm/i.test(normalized),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: '📊', text: 'Real-time expense tracking' },
    { icon: '🤖', text: 'AI-powered insights' },
    { icon: '🔒', text: 'Bank-level security' },
  ];

  return (
    <div className='min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-trackit-background dark:text-slate-50'>
      <div className='pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.95),_rgba(2,6,23,1)_70%)]' />
      <Navbar />

      <main className='relative overflow-hidden'>
        <div className='pointer-events-none absolute inset-x-0 -top-40 flex justify-center opacity-40 blur-3xl'>
          <div className='h-64 w-[40rem] bg-emerald-500/40' />
        </div>

        <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
          <div className='grid gap-12 lg:grid-cols-2 lg:gap-16'>
            {/* Left side - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className='relative z-10 flex flex-col justify-center'>
              <div className='space-y-2 mb-8'>
                <h1 className='text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50'>
                  Create your account
                </h1>
                <p className='text-slate-600 dark:text-slate-400'>
                  Join thousands tracking their finances smarter
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Name Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Full name
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='John Doe'
                    className='w-full rounded-xl border border-slate-200/60 bg-white/80 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm shadow-black/5 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-emerald-400'
                  />
                </motion.div>

                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
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
                  transition={{ duration: 0.4, delay: 0.2 }}>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
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

                <div
                  className='mt-2 text-xs text-slate-500'
                  aria-live='polite'
                >
                  <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    Password must include
                  </p>
                  <ul className='mt-2 grid gap-2 text-sm sm:grid-cols-2'>
                    {requirementState.map((requirement) => (
                      <li
                        key={requirement.id}
                        className='flex items-center gap-2 rounded-xl border border-slate-200/40 bg-white/60 px-3 py-2 text-slate-600 shadow-sm shadow-black/5 transition dark:border-trackit-border/60 dark:bg-slate-900/40 dark:text-slate-300'
                      >
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
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confirm Password Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                    Confirm password
                  </label>
                  <div className='relative'>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name='confirmPassword'
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder='••••••••'
                      className={getInputClass(fieldErrors.confirmPassword, 'pr-10')}
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>
                      {showConfirmPassword ? (
                        <FiEyeOff className='h-4 w-4' />
                      ) : (
                        <FiEye className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Terms Checkbox */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className='flex items-start gap-3'>
                  <input
                    type='checkbox'
                    id='terms'
                    checked={agreedToTerms}
                    onChange={(event) => setAgreedToTerms(event.target.checked)}
                    className='mt-1 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 dark:border-slate-600'
                  />
                  <label
                    htmlFor='terms'
                    className='text-sm text-slate-600 dark:text-slate-400'>
                    I agree to the{' '}
                    <a
                      href='#'
                      className='font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href='#'
                      className='font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'>
                      Privacy Policy
                    </a>
                  </label>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  whileHover={isSignUpReady && !showSignUpLoading ? { y: -2 } : undefined}
                  whileTap={isSignUpReady && !showSignUpLoading ? { scale: 0.98 } : undefined}
                  type='submit'
                  disabled={!isSignUpReady || showSignUpLoading}
                  aria-busy={showSignUpLoading}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-trackit-accent to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition ${
                    showSignUpLoading || !isSignUpReady
                      ? 'cursor-not-allowed opacity-80 shadow-none from-slate-500 via-slate-500 to-slate-600 bg-gradient-to-r disabled:text-slate-200'
                      : 'hover:shadow-xl'
                  }`}
                >
                  <span className='inline-flex items-center gap-2'>
                    {showSignUpLoading ? (
                      <>
                        <LoadingIndicator />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <FiArrowRight className='h-4 w-4' />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Sign In Link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className='text-center text-sm text-slate-600 dark:text-slate-400'>
                  Already have an account?{' '}
                  <Link
                    to='/signin'
                    className='font-medium text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'>
                    Sign in
                  </Link>
                </motion.p>
              </form>
            </motion.div>

            {/* Right side - Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='relative z-10 hidden lg:flex flex-col justify-center'>
              <div className='space-y-6'>
                <div className='inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-500/10 px-3 py-1 w-fit text-xs font-medium text-emerald-600 shadow-sm shadow-emerald-500/20 dark:border-emerald-400/40 dark:text-emerald-300'>
                  <HiOutlineSparkles className='h-4 w-4' />
                  Why join TrackIt
                </div>

                <div className='space-y-4'>
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className='flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-white/50 p-4 shadow-sm shadow-black/5 dark:border-trackit-border/60 dark:bg-slate-900/30'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl flex-shrink-0'>
                        {feature.icon}
                      </div>
                      <div>
                        <p className='font-semibold text-slate-900 dark:text-slate-50'>
                          {feature.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className='rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 space-y-4'>
                  <div className='flex items-center gap-2'>
                    <FiCheck className='h-5 w-5 text-emerald-500' />
                    <span className='font-semibold text-slate-900 dark:text-slate-50'>
                      Free while in beta
                    </span>
                  </div>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Get full access to all features at no cost. We're building
                    something special and want your feedback.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
