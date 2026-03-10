import React from 'react'

const LoadingIndicator = () => (
  <span className="inline-flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-400">
    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
  </span>
)

export default LoadingIndicator
