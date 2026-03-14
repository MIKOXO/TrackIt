import React from 'react'
import { motion } from 'framer-motion'

const SkeletonLoader = ({ 
  cardCount = 4, 
  gridCols = 'lg:grid-cols-4',
  cardHeight = 'h-32',
  showCharts = false,
  chartCount = 1 
}) => {
  const shimmer = {
    initial: { backgroundPosition: '200% center' },
    animate: { backgroundPosition: '-200% center' },
  }

  const skeletonClass =
    'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 bg-[length:200%_100%]'

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className={`grid gap-6 sm:grid-cols-2 ${gridCols}`}>
        {[...Array(cardCount)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
          >
            <div className="flex items-center justify-between">
              <div className={`h-12 w-12 rounded-xl ${skeletonClass}`} />
            </div>
            <motion.div
              className={`mt-4 h-8 w-24 rounded-lg ${skeletonClass}`}
              animate="animate"
              initial="initial"
              variants={shimmer}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className={`mt-3 h-4 w-16 rounded ${skeletonClass}`}
              animate="animate"
              initial="initial"
              variants={shimmer}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      {showCharts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {[...Array(chartCount)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
            >
              <motion.div
                className={`h-6 w-40 rounded ${skeletonClass}`}
                animate="animate"
                initial="initial"
                variants={shimmer}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className={`mt-2 h-4 w-56 rounded ${skeletonClass}`}
                animate="animate"
                initial="initial"
                variants={shimmer}
                transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div
                className={`mt-6 ${cardHeight} w-full rounded-lg ${skeletonClass}`}
                animate="animate"
                initial="initial"
                variants={shimmer}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default SkeletonLoader
