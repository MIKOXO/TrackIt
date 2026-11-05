import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const VARIANT_STYLES = {
  error: {
    container: 'border-rose-200/80 bg-rose-50/90 dark:border-rose-500/40 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-200',
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
  },
  success: {
    container: 'border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-500/40 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-200',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  info: {
    container: 'border-sky-200/80 bg-sky-50/90 dark:border-sky-500/40 dark:bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-200',
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
  },
};

const VARIANT_ICONS = {
  error: FiAlertCircle,
  success: FiCheckCircle,
  info: FiInfo,
};

const FormAlert = ({ variant = 'error', message, title, onDismiss, onPause, onResume }) => {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.error;
  const Icon = VARIANT_ICONS[variant] ?? VARIANT_ICONS.error;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocus={onPause}
      onBlur={onResume}
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 ${styles.container}`}>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
        <Icon className='h-4 w-4' aria-hidden='true' />
      </span>
      <div className='min-w-0 flex-1'>
        {title ? <p className={`text-sm font-semibold ${styles.text}`}>{title}</p> : null}
        <p className={`text-sm font-medium leading-5 ${styles.text}`}>{message}</p>
      </div>
      {onDismiss ? (
        <button
          type='button'
          onClick={onDismiss}
          aria-label='Dismiss notification'
          className='shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-black/5 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200'>
          <FiX className='h-4 w-4' aria-hidden='true' />
        </button>
      ) : null}
    </div>
  );
};

export default FormAlert;
