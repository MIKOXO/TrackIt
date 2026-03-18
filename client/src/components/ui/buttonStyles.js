export const PRIMARY_BUTTON_BASE =
  'relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300';

export const getPrimaryButtonClass = (disabled) =>
  [
    PRIMARY_BUTTON_BASE,
    disabled
      ? 'from-slate-500 via-slate-500 to-slate-600'
      : 'from-trackit-accent to-emerald-500 hover:shadow-xl',
    'disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-none disabled:text-slate-200',
  ].join(' ');
