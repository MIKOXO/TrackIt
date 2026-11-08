export const PRIMARY_BUTTON_BASE =
  'relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(2,6,23,0.08),0_5px_12px_-5px_rgba(34,197,94,0.38)] transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-trackit-accent/25';

export const getPrimaryButtonClass = (disabled) =>
  [
    PRIMARY_BUTTON_BASE,
    disabled
      ? 'bg-slate-200 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
      : 'bg-trackit-accent hover:-translate-y-0.5 hover:shadow-[0_4px_10px_-2px_rgba(34,197,94,0.32)] active:translate-y-0 active:shadow-sm',
    'disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none',
  ].join(' ');
