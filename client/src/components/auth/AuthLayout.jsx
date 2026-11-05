import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Navbar from '../layout/Navbar.jsx'
import Footer from '../layout/Footer.jsx'

const showcaseSlides = [
  { kind: 'chat', label: 'AI assistant', insight: 'Personalized answers from your spending history', change: 'AI' },
  { kind: 'trend', label: 'Monthly spending', amount: '$2,840', limit: 'of $4,000', insight: '12% less than last month', change: '↓ 12%', path: 'M4 96 C38 90 43 63 75 70 S118 83 145 58 S192 65 215 45 S255 51 282 30 S326 40 356 12', dot: [356, 12] },
  { kind: 'categories', label: 'Spending breakdown', insight: 'Essentials are your biggest category', change: '46%' },
]

const AuthShowcase = () => {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (isPaused || reduceMotion) return undefined
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % showcaseSlides.length), 5200)
    return () => window.clearInterval(timer)
  }, [isPaused, reduceMotion])

  const slide = showcaseSlides[activeSlide]

  return <motion.aside
    initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.12 }}
    onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
    className='relative hidden min-h-[470px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white/40 p-8 dark:border-trackit-border/80 dark:bg-slate-900/20 lg:flex lg:flex-col lg:justify-between'>
    <div>
      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400'>A clearer view</p>
      <h2 className='mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50'>Your money, <span className='text-emerald-600 dark:text-emerald-400'>in perspective.</span></h2>
      <p className='mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400'>See where it goes, spot the patterns, and make your next move with confidence.</p>
    </div>
    <div className='relative mx-auto my-7 w-full max-w-[390px] py-3' aria-live='polite'>
      <AnimatePresence mode='wait' initial={false}>
        <motion.div key={activeSlide} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: .35 }}>
      {slide.kind === 'chat' ? <div className='min-h-[255px] py-2'>
        <div className='mb-5 flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300'>AI</div>
          <div><p className='text-sm font-medium text-slate-900 dark:text-white'>TrackIt Assistant</p><p className='text-[10px] text-slate-500 dark:text-slate-400'>Personal finance guidance</p></div>
          <span className='ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500' />
        </div>
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15 }} className='ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-slate-100 px-3.5 py-2.5 text-xs leading-5 text-slate-700 dark:bg-slate-800 dark:text-slate-200'>How can I reduce my spending this month?</motion.div>
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .55 }} className='mt-3 max-w-[92%] rounded-2xl rounded-bl-sm border border-slate-200/80 bg-white/70 px-3.5 py-2.5 text-xs leading-5 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200'>Dining is up <span className='font-semibold text-slate-900 dark:text-white'>18% this month</span>. Setting a weekly dining limit could help you save about <span className='font-semibold text-slate-900 dark:text-white'>$65</span>.</motion.div>
        <div className='mt-5 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[11px] text-slate-400 dark:border-slate-700 dark:text-slate-500'><span className='flex-1'>Ask about your finances...</span><span className='rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white dark:bg-slate-200 dark:text-slate-900'>Send</span></div>
      </div> : slide.kind === 'categories' ? <div className='min-h-[255px] py-3'>
        <p className='mb-6 text-xs text-slate-500 dark:text-slate-400'>Where your money goes</p>
        <div className='space-y-5'>{[['Essentials', '46%', 46], ['Lifestyle', '32%', 32], ['Transport', '14%', 14], ['Other', '8%', 8]].map(([name, value, width], i) => <div key={name}>
          <div className='mb-2 flex justify-between text-xs'><span className='text-slate-700 dark:text-slate-200'>{name}</span><span className='text-slate-500 dark:text-slate-400'>{value}</span></div>
          <div className='h-1.5 rounded-full bg-slate-100 dark:bg-slate-800'><motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: .65, delay: .12 * i }} className={`h-full rounded-full ${i === 0 ? 'bg-slate-700 dark:bg-slate-300' : 'bg-slate-400 dark:bg-slate-600'}`} /></div>
        </div>)}</div>
      </div> : <>
      <div className='flex items-end justify-between gap-3'>
        <div><p className='text-xs text-slate-500 dark:text-slate-400'>{slide.label}</p><p className='mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white'>{slide.amount}</p></div>
        <p className='pb-1 text-xs text-slate-500 dark:text-slate-400'>{slide.limit}</p>
      </div>
      <div className='relative mt-5 h-36 border-b border-slate-200 dark:border-slate-700' aria-label={`${slide.label} chart`}>
        <div className='absolute inset-x-0 top-1/4 border-t border-dashed border-slate-200 dark:border-slate-800' />
        <div className='absolute inset-x-0 top-2/4 border-t border-dashed border-slate-200 dark:border-slate-800' />
        <svg viewBox='0 0 360 120' className='absolute inset-0 h-full w-full overflow-visible' role='img' aria-label='Spending trends steadily upward'>
          <motion.path d={slide.path} fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' className='text-slate-700 dark:text-slate-300' initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 1.1, ease: 'easeInOut', delay: .1 }} />
          <motion.circle cx={slide.dot[0]} cy={slide.dot[1]} r='4' className='fill-emerald-600 dark:fill-emerald-400' initial={reduceMotion ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ duration: .25, delay: .95 }} />
        </svg>
      </div>
      <div className='mt-3 flex justify-between text-[10px] text-slate-400 dark:text-slate-500'><span>WEEK 1</span><span>WEEK 2</span><span>WEEK 3</span><span>WEEK 4</span></div>
      </>}
      <motion.div className='mt-8 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800'>
        <div><p className='text-xs text-slate-500 dark:text-slate-400'>TrackIt insight</p><p className='mt-1 text-sm font-medium text-slate-900 dark:text-slate-100'>{slide.insight}</p></div>
        <span className='text-sm font-semibold text-emerald-700 dark:text-emerald-400'>{slide.change}</span>
      </motion.div>
        </motion.div>
      </AnimatePresence>
      <div className='mt-4 flex items-center justify-center gap-2' aria-label='Showcase slides'>
        {showcaseSlides.map((item, index) => <button key={item.label} type='button' aria-label={`Show ${item.label}`} aria-current={index === activeSlide ? 'true' : undefined} onClick={() => setActiveSlide(index)} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? 'w-6 bg-slate-700 dark:bg-slate-300' : 'w-1.5 bg-slate-300 hover:bg-slate-500 dark:bg-slate-700 dark:hover:bg-slate-500'}`} />)}
      </div>
    </div>
    <div className='flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400'><span className='h-px w-8 bg-slate-300 dark:bg-slate-700' />Clarity for every transaction</div>
  </motion.aside>
}

const AuthLayout = ({ children }) => (
  <div className='min-h-screen bg-white text-slate-900 dark:bg-trackit-background dark:text-slate-50'>
    <Navbar />
    <main className='relative isolate mx-auto grid min-h-[calc(100vh-145px)] max-w-6xl items-center gap-10 overflow-hidden px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16 lg:px-8'>
      <div aria-hidden className='pointer-events-none absolute inset-x-0 -top-32 -z-10 flex justify-center opacity-45 blur-3xl'>
        <div className='h-56 w-[44rem] rounded-full bg-emerald-400/35 dark:bg-emerald-500/20' />
      </div>
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} className='mx-auto w-full max-w-[390px]'>
        {children}
      </motion.section>
      <AuthShowcase />
    </main>
    <Footer />
  </div>
)

export default AuthLayout
