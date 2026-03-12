import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const glowVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: 'easeOut' } },
}

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.6, ease: 'easeOut' } },
}

const NotFound = () => (
  <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black px-6 py-12 text-center text-slate-100">
    <motion.div
      className="absolute inset-0 overflow-hidden"
      aria-hidden
      initial="hidden"
      animate="visible"
      variants={glowVariants}
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_65%)]"
        style={{ filter: 'blur(60px)' }}
        animate={{ opacity: [0, 0.6, 0], transition: { duration: 8, repeat: Infinity } }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_60%)]"
        style={{ filter: 'blur(80px)' }}
        animate={{ opacity: [0.2, 0.8, 0.2], transition: { duration: 10, repeat: Infinity } }}
      />
    </motion.div>

    <motion.div
      className="relative z-10 max-w-xl space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-emerald-500/10 backdrop-blur"
      initial="hidden"
      animate="visible"
      variants={textVariants}
    >
      <motion.span className="text-sm font-semibold uppercase tracking-[0.6em] text-emerald-300" variants={textVariants}>
        404 Error
      </motion.span>
      <motion.h1 className="text-4xl font-bold text-white md:text-5xl" variants={textVariants}>
        We couldn’t find that page
      </motion.h1>
      <motion.p className="text-base text-slate-300" variants={textVariants}>
        The link you followed seems to have drifted off course. No worries—our command center is ready to jump back to safety.
      </motion.p>
      <motion.div className="flex flex-col gap-3 sm:flex-row sm:justify-center" variants={textVariants}>
        <Link
          to="/"
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-400"
        >
          Return home
        </Link>
        <Link
          to="/dashboard"
          className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          Go to dashboard
        </Link>
      </motion.div>
    </motion.div>
  </div>
)

export default NotFound
