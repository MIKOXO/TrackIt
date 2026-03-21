export const PRIMARY_BUTTON_BASE =
  'relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300';

export const getPrimaryButtonClass = (disabled) =>
  [
    PRIMARY_BUTTON_BASE,
    disabled
      ? 'bg-slate-200 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
      : 'bg-gradient-to-r from-trackit-accent to-emerald-500 hover:shadow-xl',
    'disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' ');
