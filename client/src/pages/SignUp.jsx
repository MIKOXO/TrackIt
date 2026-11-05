import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { register, googleLogin } from '../services/authService.js';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { getServerMessage } from '../utils/errorUtils.js';
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
      formData.confirmPassword,
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
      showToast(
        response.data.message || 'Account created. Check your email for a code.',
        { type: 'success' },
      );
      navigate('/verify-email', {
        replace: true,
        state: { email: formData.email.trim(), codeSent: true },
      });
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
    dispatch(setError(null));
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
      const message = getServerMessage(err, 'Unable to sign up with Google.');
      dispatch(setError(message));
      showToast(message, { type: 'error' });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleError = () => {
    showToast('Google sign-in failed.', { type: 'error' });
  };

  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)
  const passwordMatches = Boolean(formData.confirmPassword && formData.password === formData.confirmPassword)
  const showConfirmError = Boolean(formData.confirmPassword && confirmTouched && !passwordMatches)

  return (
    <AuthLayout>
      <div className='mb-4'>
        <h1 className='text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50'>Create your account</h1>
        <p className='mt-1.5 text-sm text-slate-600 dark:text-slate-400'>A clearer picture of your finances starts here.</p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-2.5'>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? <>
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} isLoading={loading} />
          <div className='flex items-center gap-3 py-0.5'><div className='h-px flex-1 bg-slate-200 dark:bg-trackit-border' /><span className='text-xs text-slate-400'>or</span><div className='h-px flex-1 bg-slate-200 dark:bg-trackit-border' /></div>
        </> : null}
        <div>
          <label htmlFor='signup-name' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>Full name</label>
          <input id='signup-name' type='text' name='name' value={formData.name} onChange={handleChange} placeholder='Your name' autoComplete='name' className={getInputClass(false, 'py-2.5')} />
        </div>
        <div>
          <label htmlFor='signup-email' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>Email address</label>
          <input id='signup-email' type='email' name='email' value={formData.email} onChange={handleChange} placeholder='you@example.com' autoComplete='email' className={getInputClass(fieldErrors.email, 'py-2.5')} />
        </div>
        <div>
          <label htmlFor='signup-password' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>Password</label>
          <div className='relative'>
            <input id='signup-password' type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={handleChange} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} placeholder='Create a password' autoComplete='new-password' className={getInputClass(fieldErrors.password, 'py-2.5 pr-10')} />
            <button type='button' aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>{showPassword ? <FiEyeOff className='h-4 w-4' /> : <FiEye className='h-4 w-4' />}</button>
          </div>
          <AnimatePresence initial={false}>
            {(passwordFocused || formData.password) && <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className='mt-2 grid grid-cols-2 gap-x-3 gap-y-1 overflow-hidden text-[11px] text-slate-500' aria-live='polite'>
              {requirementState.map((requirement) => <motion.li key={requirement.id} layout className={`flex items-center gap-1.5 ${requirement.isValid ? 'text-emerald-600 dark:text-emerald-400' : ''}`}><motion.span initial={false} animate={{ scale: requirement.isValid ? 1 : .85 }} className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${requirement.isValid ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-slate-100 dark:bg-slate-800'}`}>{requirement.isValid ? <FiCheck className='h-2.5 w-2.5' /> : <span className='h-1 w-1 rounded-full bg-current' />}</motion.span>{requirement.label}</motion.li>)}
            </motion.ul>}
          </AnimatePresence>
        </div>
        <div>
          <label htmlFor='signup-confirm-password' className='mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300'>Confirm password</label>
          <div className='relative'>
            <input id='signup-confirm-password' type={showConfirmPassword ? 'text' : 'password'} name='confirmPassword' value={formData.confirmPassword} onChange={(e) => { handleChange(e); if (e.target.value) setConfirmTouched(true) }} onBlur={() => setConfirmTouched(true)} placeholder='Repeat your password' autoComplete='new-password' aria-invalid={showConfirmError || fieldErrors.confirmPassword} className={getInputClass(showConfirmError || fieldErrors.confirmPassword, 'py-2.5 pr-16')} />
            {passwordMatches ? <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className='absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500' aria-label='Passwords match'><FiCheck className='h-4 w-4' /></motion.span> : null}
            <button type='button' aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>{showConfirmPassword ? <FiEyeOff className='h-4 w-4' /> : <FiEye className='h-4 w-4' />}</button>
          </div>
          {(showConfirmError || fieldErrors.confirmPassword) && <p className='mt-1 text-[11px] text-rose-600 dark:text-rose-400' role='alert'>Passwords do not match.</p>}
        </div>
        <motion.button whileTap={isSignUpReady && !showSignUpLoading ? { scale: .98 } : undefined} type='submit' disabled={!isSignUpReady || showSignUpLoading} aria-busy={showSignUpLoading} className={getPrimaryButtonClass(showSignUpLoading || !isSignUpReady)}>
          <span className='inline-flex items-center gap-2'>{showSignUpLoading ? <><LoadingIndicator />Creating account...</> : <>Create account<FiArrowRight className='h-4 w-4' /></>}</span>
        </motion.button>
        <p className='pt-1 text-center text-xs text-slate-600 dark:text-slate-400'>Already have an account? <Link to='/signin' className='font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'>Sign in</Link></p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
