import React from 'react';
import { FiGithub, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className='border-t border-slate-200/60 bg-white/90 text-slate-500 dark:border-trackit-border/70 dark:bg-trackit-background/95 dark:text-slate-400'>
      <div className='mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8'>
        <p className='text-slate-600 dark:text-slate-400'>
          © {new Date().getFullYear()} TrackIt. Built for financial clarity —
          not complexity.
        </p>
        <div className='flex items-center gap-4'>
          <a
            href='https://github.com/MIKOXO'
            target='_blank'
            className='inline-flex items-center gap-1 text-slate-500 transition hover:text-emerald-300 dark:text-slate-400'>
            <FiGithub className='h-3.5 w-3.5' />
            <span>GitHub</span>
          </a>
          <a
            href='https://x.com/mikermount19'
            target='_blank'
            className='inline-flex items-center gap-1 text-slate-500 transition hover:text-emerald-300 dark:text-slate-400'>
            <FiTwitter className='h-3.5 w-3.5' />
            <span>Updates</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
