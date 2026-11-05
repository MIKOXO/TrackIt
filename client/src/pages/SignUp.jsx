import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { register, googleLogin } from '../services/authService.js';
import FieldError from '../components/auth/FieldError.jsx';
import FormAlert from '../components/auth/FormAlert.jsx';
import { useTimedMessage } from '../hooks/useTimedMessage.js';
import { mapAuthError, getRetryAfterSeconds } from '../utils/authErrorMapper.js';
import { AUTH_FEEDBACK_TIMEOUTS } from '../constants/authFeedback.js';
import GoogleAuthButton from '../components/auth/GoogleAuthButton.jsx';
import LoadingIndicator from '../components/ui/LoadingIndicator.jsx';
import { getPrimaryButtonClass } from '../components/ui/buttonStyles.js';
import { PASSWORD_REQUIREMENTS } from '../constants/passwordRequirements.js';

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
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [fieldErrors, setFieldErrors] = useState({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const fieldErrorTimersRef = useRef({});
  const rateLimitActiveRef = useRef(false);
  const serverFieldErrorsRef = useRef(new Set());

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
    const isServerError = serverFieldErrorsRef.current.has(name);
    const isValid = name === 'name'
      ? Boolean(value.trim())
      : name === 'email'
        ? /^\S+@\S+\.\S+$/.test(value.trim())
        : name === 'password'
          ? PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value))
          : name === 'confirmPassword'
            ? Boolean(value && value === formData.password)
            : false;
    if (isServerError || isValid) {
      serverFieldErrorsRef.current.delete(name);
      clearFieldErrorTimer(name);
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

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
    serverFieldErrorsRef.current.add(field);
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
    clearFieldErrorTimer(field);
    const timer = window.setTimeout(() => {
      serverFieldErrorsRef.current.delete(field);
      delete fieldErrorTimersRef.current[field];
      setFieldErrors((prev) => (prev[field] === message ? { ...prev, [field]: null } : prev));
    }, AUTH_FEEDBACK_TIMEOUTS.serverField);
    fieldErrorTimersRef.current[field] = timer;
  };

  const showSignUpLoading = isSubmitting || loading;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRateLimited) return;
    dispatch(setLoading(true));
    dispatch(setError(null));
    clearBlockAlert();
    setRateLimitSeconds(0);
    clearAllFieldErrorTimers();
    setFieldErrors({ name: null, email: null, password: null, confirmPassword: null });
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        setFieldErrors((prev) => ({ ...prev, name: 'Name is required.' }));
        nameInputRef.current?.focus();
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
        setFieldErrors((prev) => ({ ...prev, email: 'Enter a valid email address.' }));
        emailInputRef.current?.focus();
        return;
      }
      const unmetRequirements = requirementState.filter((requirement) => !requirement.isValid);

      if (unmetRequirements.length) {
        setFieldErrors((prev) => ({
          ...prev,
          password: `Password must include ${unmetRequirements.map((requirement) => requirement.label).join(', ')}`,
        }));
        passwordInputRef.current?.focus();
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords must match.',
        }));
        confirmPasswordInputRef.current?.focus();
        return;
      }

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/verify-email', {
        replace: true,
        state: { email: formData.email.trim(), codeSent: true },
      });
    } catch (err) {
      const mapped = mapAuthError(err, 'Unable to create account. Try again shortly.');

      const retryAfterSeconds = getRetryAfterSeconds(err, 0);
      if (retryAfterSeconds > 0) {
        setRateLimitSeconds(retryAfterSeconds);
        showBlockAlert('Too many registration attempts.', 'error', 0);
        return;
      }

      if (mapped.scope === 'field') {
        setServerFieldError(mapped.field, mapped.message);
        return;
      }

      dispatch(setError(mapped.message));
      showBlockAlert(mapped.message, 'error');
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
    dispatch(setError(null));
    try {
      const response = await googleLogin({ credential });
      dispatch(setUser({ user: response.data.user }));
      const destination =
        response.data.user?.role === 'admin'
          ? '/admin/dashboard'
          : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const mapped = mapAuthError(err, 'Unable to sign up with Google.');
      dispatch(setError(mapped.message));
      const retryAfterSeconds = getRetryAfterSeconds(err, 0);
      if (retryAfterSeconds > 0) {
        setRateLimitSeconds(retryAfterSeconds);
        showBlockAlert('Too many registration attempts.', 'error', 0);
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

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const passwordMatches = Boolean(formData.confirmPassword && formData.password === formData.confirmPassword);
  const showConfirmError = Boolean(formData.confirmPassword && confirmTouched && !passwordMatches);

  return (
    <AuthLayout>
      <div className='mb-4'>
        <h1 className='text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50'>Create your account</h1>
        <p className='mt-1.5 text-sm text-slate-600 dark:text-slate-400'>A clearer picture of your finances starts here.</p>
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
      <form onSubmit={handleSubmit} noValidate className='space-y-2.5'>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <>
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} isLoading={loading} disabled={isRateLimited} />
            <div className='flex items-center gap-3 py-0.5'>
              <div className='h-px flex-1 bg-slate-200 dark:bg-trackit-border' />
              <span className='text-xs text-slate-400'>or</span>
              <div className='h-px flex-1 bg-slate-200 dark:bg-trackit-border' />
            </div>
          </>
        ) : null}
        <div>
          <label htmlFor='signup-name' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>Full name</label>
          <input id='signup-name' ref={nameInputRef} type='text' name='name' value={formData.name} onChange={handleChange} placeholder='Your name' autoComplete='name' required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined} className={getInputClass(Boolean(fieldErrors.name), 'py-2.5')} />
          <FieldError id='signup-name-error' message={fieldErrors.name} visible={Boolean(fieldErrors.name)} />
        </div>
        <div>
          <label htmlFor='signup-email' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>Email address</label>
          <input
            id='signup-email'
            ref={emailInputRef}
            type='email'
            required
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='you@example.com'
            autoComplete='email'
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            className={getInputClass(Boolean(fieldErrors.email), 'py-2.5')}
          />
          <FieldError id='signup-email-error' message={fieldErrors.email} visible={Boolean(fieldErrors.email)} />
        </div>
        <div>
          <label htmlFor='signup-password' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>Password</label>
          <div className='relative'>
            <input
              id='signup-password'
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              name='password'
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder='Create a password'
              required
              autoComplete='new-password'
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
              className={getInputClass(Boolean(fieldErrors.password), 'py-2.5 pr-10')}
            />
            <button type='button' aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>{showPassword ? <FiEyeOff className='h-4 w-4' /> : <FiEye className='h-4 w-4' />}</button>
          </div>
          <FieldError id='signup-password-error' message={fieldErrors.password} visible={Boolean(fieldErrors.password)} />
          <AnimatePresence initial={false}>
            {(passwordFocused || formData.password) && <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className='mt-2 grid grid-cols-2 gap-x-3 gap-y-1 overflow-hidden text-[11px] text-slate-500' aria-live='polite'>
              {requirementState.map((requirement) => <motion.li key={requirement.id} layout className={`flex items-center gap-1.5 ${requirement.isValid ? 'text-emerald-600 dark:text-emerald-400' : ''}`}><motion.span initial={false} animate={{ scale: requirement.isValid ? 1 : .85 }} className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${requirement.isValid ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-slate-100 dark:bg-slate-800'}`}>{requirement.isValid ? <FiCheck className='h-2.5 w-2.5' /> : <span className='h-1 w-1 rounded-full bg-current' />}</motion.span>{requirement.label}</motion.li>)}
            </motion.ul>}
          </AnimatePresence>
        </div>
        <div>
          <label htmlFor='signup-confirm-password' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>Confirm password</label>
          <div className='relative'>
            <input
              id='signup-confirm-password'
              ref={confirmPasswordInputRef}
              type={showConfirmPassword ? 'text' : 'password'}
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value) setConfirmTouched(true);
              }}
              onBlur={() => setConfirmTouched(true)}
              placeholder='Repeat your password'
              required
              autoComplete='new-password'
              aria-invalid={showConfirmError || Boolean(fieldErrors.confirmPassword)}
              aria-describedby={showConfirmError || fieldErrors.confirmPassword ? 'signup-confirm-password-error' : undefined}
              className={getInputClass(showConfirmError || Boolean(fieldErrors.confirmPassword), 'py-2.5 pr-16')}
            />
            {passwordMatches ? <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className='absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500' aria-label='Passwords match'><FiCheck className='h-4 w-4' /></motion.span> : null}
            <button type='button' aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>{showConfirmPassword ? <FiEyeOff className='h-4 w-4' /> : <FiEye className='h-4 w-4' />}</button>
          </div>
          <FieldError
            id='signup-confirm-password-error'
            message={fieldErrors.confirmPassword || 'Passwords must match.'}
            visible={Boolean(showConfirmError || fieldErrors.confirmPassword)}
          />
        </div>
        <motion.button whileTap={!showSignUpLoading && !isRateLimited ? { scale: .98 } : undefined} type='submit' disabled={showSignUpLoading || isRateLimited} aria-busy={showSignUpLoading} className={getPrimaryButtonClass(showSignUpLoading || isRateLimited)}>
          <span className='inline-flex items-center gap-2'>{showSignUpLoading ? <><LoadingIndicator />Creating account...</> : <>Create account<FiArrowRight className='h-4 w-4' /></>}</span>
        </motion.button>
        <p className='pt-1 text-center text-xs text-slate-600 dark:text-slate-400'>Already have an account? <Link to='/signin' className='font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'>Sign in</Link></p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
